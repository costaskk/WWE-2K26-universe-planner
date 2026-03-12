import { useEffect, useMemo, useRef, useState } from 'react';
import SectionCard from './components/SectionCard';
import {
  createBrandArt,
  createShowArt,
  createSuperstarArt,
  defaultBrands,
  defaultCards,
  defaultRoster,
  defaultRivalries,
  defaultTitles,
  recommendedImageSources,
} from './data';
import { api } from './lib/api';
import { downloadFile, loadState, saveState } from './utils';

const STORAGE_KEY = 'wwe2k26-universe-planner';
const ACTIVE_SLOT_STORAGE_KEY = 'wwe2k26-universe-planner-active-slot';
const DEFAULT_SLOT_NAME = 'Main Universe';

const freshState = () => ({
  brands: defaultBrands,
  roster: defaultRoster,
  titles: defaultTitles,
  rivalries: defaultRivalries,
  cards: defaultCards,
});

const defaultRivalryForm = {
  superstarA: '',
  superstarB: '',
  brandId: '',
  intensity: 'Medium',
  notes: '',
};

const defaultCardForm = { showName: '', episodeName: '', imageUrl: '' };

const createMatchDraft = () => ({
  id: crypto.randomUUID(),
  matchType: 'Singles',
  stipulation: 'Standard',
  participants: '',
});

function normalizeState(input) {
  const base = freshState();
  if (!input || typeof input !== 'object') return base;

  const brands = Array.isArray(input.brands)
    ? input.brands.map((brand) => ({
        ...brand,
        color: brand.color || '#7c3aed',
        imageUrl: brand.imageUrl || createBrandArt(brand.name, brand.color || '#7c3aed'),
      }))
    : base.brands;

  const brandColorMap = Object.fromEntries(brands.map((brand) => [brand.id, brand.color || '#7c3aed']));

  return {
    brands,
    roster: Array.isArray(input.roster)
      ? input.roster.map((star) => ({
          ...star,
          imageUrl: star.imageUrl || createSuperstarArt(star.name, brandColorMap[star.brandId] || '#334155', star.division || 'Main Event'),
        }))
      : base.roster,
    titles: Array.isArray(input.titles) ? input.titles : base.titles,
    rivalries: Array.isArray(input.rivalries) ? input.rivalries : base.rivalries,
    cards: Array.isArray(input.cards)
      ? input.cards.map((card) => ({
          ...card,
          imageUrl: card.imageUrl || createShowArt(card.showName, card.episodeName, '#7c3aed'),
        }))
      : base.cards,
  };
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9_-]{3,24}$/.test(username.trim());
}

function formatTimestamp(value) {
  if (!value) return 'Never';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleString();
}

function getErrorMessage(error, fallback) {
  if (!error) return fallback;
  if (error.name === 'TypeError' && /fetch/i.test(error.message || '')) {
    return 'Could not reach the profile API. Check Vercel environment variables, API routes, and package dependencies, then redeploy.';
  }
  return error.message || fallback;
}

function Modal({ modal, onClose }) {
  if (!modal) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div className={`modal-card ${modal.variant || 'info'}`} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true">
        <div className="modal-header">
          <div>
            <span className={`status-pill ${modal.variant || 'info'}`}>{modal.label || 'Notice'}</span>
            <h3>{modal.title}</h3>
          </div>
          <button className="ghost-icon" type="button" onClick={onClose} aria-label="Close modal">×</button>
        </div>
        <p>{modal.message}</p>
        {modal.details ? <pre className="modal-details">{modal.details}</pre> : null}
        <div className="section-actions left">
          <button type="button" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`toast ${toast.variant || 'info'}`} role="status" aria-live="polite">
      <strong>{toast.title}</strong>
      <span>{toast.message}</span>
    </div>
  );
}

function MediaThumb({ src, alt, compact = false, logo = null }) {
  return (
    <div className={`media-thumb ${compact ? 'compact' : ''}`}>
      {src ? <img src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.display = 'none'; event.currentTarget.nextSibling?.classList.add('show'); }} /> : null}
      <div className={`media-fallback ${src ? '' : 'show'}`}>
        {logo ? <span className="media-logo-mark">{logo}</span> : null}
        <span>No image</span>
      </div>
    </div>
  );
}

function AuthPanel({
  session,
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  authBusy,
  authMessage,
  onSubmit,
  onSignOut,
  cloudStatus,
  activeSlotName,
}) {
  if (session?.user) {
    const userName = session.user.username || 'Player';

    return (
      <div className="auth-panel signed-in">
        <div>
          <strong>Signed in as @{userName}</strong>
          <p>
            Active slot: <strong>{activeSlotName || DEFAULT_SLOT_NAME}</strong>. Your choices autosave to your account and sync across devices.
          </p>
        </div>
        <div className="auth-actions">
          <span className="status-pill success">{cloudStatus}</span>
          <button className="secondary" onClick={onSignOut} type="button">Sign out</button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <div className="auth-switcher">
        <button className={authMode === 'login' ? '' : 'secondary'} type="button" onClick={() => setAuthMode('login')}>
          Login
        </button>
        <button className={authMode === 'register' ? '' : 'secondary'} type="button" onClick={() => setAuthMode('register')}>
          Register
        </button>
      </div>
      <form className="stack-form auth-form" onSubmit={onSubmit}>
        <input
          autoComplete="username"
          value={authForm.username}
          onChange={(event) => setAuthForm((current) => ({ ...current, username: event.target.value }))}
          placeholder="Username"
          required
        />
        <input
          type="password"
          autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
          value={authForm.password}
          onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
          placeholder="Password"
          minLength={6}
          required
        />
        <button type="submit" disabled={authBusy}>{authBusy ? 'Please wait...' : authMode === 'login' ? 'Sign in' : 'Create profile'}</button>
      </form>
      <p className="muted auth-hint">
        Usernames must be 3 to 24 characters and can use letters, numbers, underscores, or dashes. No email is stored.
      </p>
      {authMessage ? <p className="muted auth-message">{authMessage}</p> : null}
    </div>
  );
}

function SlotPanel({
  session,
  slots,
  activeSlotId,
  slotName,
  setSlotName,
  onCreateSlot,
  onSelectSlot,
  onDeleteSlot,
  slotBusy,
}) {
  return (
    <div className="slot-panel">
      <div className="slot-panel-top">
        <div>
          <strong>{session?.user ? 'Cloud save slots' : 'Guest mode only'}</strong>
          <p>
            {session?.user
              ? 'Create multiple universes for separate rosters, eras, or promotions.'
              : 'Sign in to unlock multiple cloud save slots and profile-based syncing.'}
          </p>
        </div>
      </div>

      {session?.user ? (
        <>
          <form className="inline-form slot-form" onSubmit={onCreateSlot}>
            <input
              value={slotName}
              onChange={(event) => setSlotName(event.target.value)}
              placeholder="New save slot name"
              maxLength={40}
            />
            <button type="submit" disabled={slotBusy}>{slotBusy ? 'Working...' : 'Create Slot'}</button>
          </form>
          <div className="slot-list">
            {slots.map((slot) => (
              <article key={slot.id} className={`slot-card ${slot.id === activeSlotId ? 'active' : ''}`}>
                <div>
                  <strong>{slot.slot_name}</strong>
                  <p>Updated {formatTimestamp(slot.updated_at)}</p>
                </div>
                <div className="slot-actions">
                  <button type="button" className={slot.id === activeSlotId ? '' : 'secondary'} onClick={() => onSelectSlot(slot.id)}>
                    {slot.id === activeSlotId ? 'Active' : 'Open'}
                  </button>
                  <button type="button" className="danger ghost" disabled={slots.length <= 1 || slotBusy} onClick={() => onDeleteSlot(slot.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <article className="save-mode-card">
          <strong>Local browser save</strong>
          <p>This device keeps one guest universe locally. Profiles unlock multiple synced save slots.</p>
        </article>
      )}
    </div>
  );
}

function BrandBoard({ brands, rosterByBrand, onImageChange }) {
  return (
    <div className="brand-board">
      {rosterByBrand.map((brand) => (
        <article key={brand.id} className="visual-card brand-visual" style={{ borderColor: brand.color, boxShadow: `0 18px 50px ${brand.color}20` }}>
          <MediaThumb src={brand.imageUrl} alt={brand.name} logo={brand.name.slice(0, 2).toUpperCase()} />
          <div className="visual-content">
            <div className="mini-card-top">
              <div>
                <strong className="display-name">{brand.name}</strong>
                <div className="brand-accent-line" style={{ background: brand.color }} />
              </div>
              <span className="badge neutral">{brand.stars.length} assigned</span>
            </div>
            <input value={brand.imageUrl || ''} onChange={(event) => onImageChange(brand.id, event.target.value)} placeholder="Brand image URL" />
          </div>
        </article>
      ))}
    </div>
  );
}

function SourceLibrary() {
  return (
    <div className="source-library">
      {recommendedImageSources.map((source) => (
        <article key={source.name} className="mini-card source-card">
          <div className="mini-card-top">
            <strong>{source.name}</strong>
            <span className="badge neutral">{source.type}</span>
          </div>
          <p>{source.note}</p>
          <a href={source.url} target="_blank" rel="noreferrer">Open source</a>
        </article>
      ))}
    </div>
  );
}

export default function App() {
  const [state, setState] = useState(() => loadState(STORAGE_KEY, freshState()));
  const [brandName, setBrandName] = useState('');
  const [brandColor, setBrandColor] = useState('#7c3aed');
  const [rosterName, setRosterName] = useState('');
  const [rosterImageUrl, setRosterImageUrl] = useState('');
  const [brandImageUrl, setBrandImageUrl] = useState('');
  const [rivalryForm, setRivalryForm] = useState(defaultRivalryForm);
  const [cardForm, setCardForm] = useState(defaultCardForm);
  const [matchDrafts, setMatchDrafts] = useState([createMatchDraft()]);
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [authForm, setAuthForm] = useState({ username: '', password: '' });
  const [cloudStatus, setCloudStatus] = useState('Checking profiles…');
  const [saveSlots, setSaveSlots] = useState([]);
  const [activeSlotId, setActiveSlotId] = useState(() => localStorage.getItem(ACTIVE_SLOT_STORAGE_KEY) || null);
  const [slotName, setSlotName] = useState('');
  const [slotBusy, setSlotBusy] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [assignmentLookupId, setAssignmentLookupId] = useState('');

  const skipNextCloudSave = useRef(false);
  const cloudHydratedForUser = useRef(null);

  const showToast = (title, message, variant = 'info') => {
    setToast({ title, message, variant });
  };

  const showModal = (title, message, variant = 'info', details = '') => {
    setModal({ title, message, variant, details, label: variant === 'error' ? 'Problem' : variant === 'success' ? 'Success' : 'Info' });
  };

  useEffect(() => {
    if (!toast) return undefined;
    const timeoutId = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  useEffect(() => {
    saveState(STORAGE_KEY, state);
  }, [state]);

  useEffect(() => {
    if (activeSlotId) {
      localStorage.setItem(ACTIVE_SLOT_STORAGE_KEY, activeSlotId);
    } else {
      localStorage.removeItem(ACTIVE_SLOT_STORAGE_KEY);
    }
  }, [activeSlotId]);

  useEffect(() => {
    let mounted = true;

    api.getSession()
      .then((data) => {
        if (!mounted) return;
        const nextSession = data?.user ? { user: data.user } : null;
        setSession(nextSession);
        setCloudStatus(nextSession ? 'Syncing cloud save…' : 'Signed out');
      })
      .catch((error) => {
        if (!mounted) return;
        const message = getErrorMessage(error, 'Could not reach the profile server.');
        setAuthMessage(message);
        setCloudStatus('Profiles unavailable');
        showModal('API connection problem', message, 'error');
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.user?.id) {
      cloudHydratedForUser.current = null;
      setSaveSlots([]);
      setActiveSlotId(null);
      return;
    }

    const hydrateCloudSlots = async () => {
      setCloudStatus('Loading your universes…');

      try {
        const response = await api.listUniverses();
        let slots = response.universes ?? [];

        if (!slots.length) {
          const created = await createCloudSlot(DEFAULT_SLOT_NAME, state);
          if (!created) return;
          slots = [created];
        }

        setSaveSlots(slots);

        const requestedSlot = activeSlotId && slots.find((slot) => slot.id === activeSlotId) ? activeSlotId : slots[0].id;
        const selected = slots.find((slot) => slot.id === requestedSlot) || slots[0];

        skipNextCloudSave.current = true;
        setActiveSlotId(selected.id);
        setState(normalizeState(selected.data));
        setCloudStatus(`Loaded ${selected.slot_name}`);
        cloudHydratedForUser.current = session.user.id;
        showToast('Profile loaded', `Welcome back, @${session.user.username}.`, 'success');
      } catch (error) {
        const message = getErrorMessage(error, 'Could not load your universes.');
        setCloudStatus('Cloud load failed');
        setAuthMessage(message);
        showModal('Could not load cloud saves', message, 'error');
      }
    };

    hydrateCloudSlots();
  }, [session?.user?.id]);

  useEffect(() => {
    if (!session?.user?.id || !activeSlotId) return;
    if (cloudHydratedForUser.current !== session.user.id) return;

    if (skipNextCloudSave.current) {
      skipNextCloudSave.current = false;
      return;
    }

    const timeoutId = window.setTimeout(() => {
      saveUniverseToCloud(activeSlotId, state, 'All changes saved');
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [state, session?.user?.id, activeSlotId]);

  const brandMap = useMemo(
    () => Object.fromEntries(state.brands.map((brand) => [brand.id, brand])),
    [state.brands]
  );

  const superstarMap = useMemo(
    () => Object.fromEntries(state.roster.map((star) => [star.id, star])),
    [state.roster]
  );

  const rosterByBrand = useMemo(() => {
    return state.brands.map((brand) => ({
      ...brand,
      stars: state.roster.filter((star) => star.brandId === brand.id),
    }));
  }, [state.brands, state.roster]);

  const freeAgents = useMemo(() => state.roster.filter((star) => !star.brandId), [state.roster]);

  const summary = useMemo(() => {
    const champions = state.titles.filter((title) => title.holderId).length;
    return {
      brands: state.brands.length,
      superstars: state.roster.length,
      rivalries: state.rivalries.length,
      cards: state.cards.length,
      champions,
      assigned: state.roster.filter((star) => star.brandId).length,
    };
  }, [state]);

  const activeSlotName = useMemo(
    () => saveSlots.find((slot) => slot.id === activeSlotId)?.slot_name || DEFAULT_SLOT_NAME,
    [saveSlots, activeSlotId]
  );

  const assignmentLookupStar = useMemo(
    () => state.roster.find((star) => star.id === assignmentLookupId) || null,
    [assignmentLookupId, state.roster]
  );

  async function createCloudSlot(name, sourceState = freshState()) {
    if (!session?.user?.id) return null;

    try {
      const response = await api.createUniverse({ slotName: name.trim(), data: normalizeState(sourceState) });
      return response.universe;
    } catch (error) {
      const message = getErrorMessage(error, 'Could not create save slot.');
      setAuthMessage(message);
      setCloudStatus('Cloud save failed');
      showModal('Save slot failed', message, 'error');
      return null;
    }
  }

  async function saveUniverseToCloud(slotId, nextState, successLabel = 'All changes saved') {
    if (!session?.user?.id || !slotId) return;

    setCloudStatus('Saving to cloud…');

    try {
      const response = await api.saveUniverse({ id: slotId, data: normalizeState(nextState) });
      const saved = response.universe;
      setSaveSlots((current) => {
        const next = current.some((slot) => slot.id === saved.id)
          ? current.map((slot) => (slot.id === saved.id ? saved : slot))
          : [saved, ...current];
        return [...next].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      });
      setCloudStatus(successLabel);
    } catch (error) {
      const message = getErrorMessage(error, 'Could not save your universe.');
      setCloudStatus('Cloud save failed');
      setAuthMessage(message);
      showModal('Autosave failed', message, 'error');
    }
  }

  const updateStateList = (key, updater) => {
    setState((current) => ({ ...current, [key]: updater(current[key]) }));
  };

  const addBrand = (event) => {
    event.preventDefault();
    if (!brandName.trim()) return;
    updateStateList('brands', (brands) => [
      ...brands,
      { id: crypto.randomUUID(), name: brandName.trim(), color: brandColor, imageUrl: brandImageUrl.trim() || createBrandArt(brandName.trim(), brandColor) },
    ]);
    setBrandName('');
    setBrandImageUrl('');
    showToast('Brand added', `${brandName.trim()} is ready for your draft.`, 'success');
  };

  const updateBrand = (id, field, value) => {
    updateStateList('brands', (brands) => brands.map((brand) => (brand.id === id ? { ...brand, [field]: value } : brand)));
  };

  const addSuperstar = (event) => {
    event.preventDefault();
    if (!rosterName.trim()) return;
    updateStateList('roster', (roster) => [
      ...roster,
      {
        id: crypto.randomUUID(),
        name: rosterName.trim(),
        brandId: null,
        alignment: 'Face',
        division: 'Main Event',
        imageUrl: rosterImageUrl.trim() || createSuperstarArt(rosterName.trim(), '#334155', 'Main Event'),
      },
    ]);
    setRosterName('');
    setRosterImageUrl('');
    showToast('Superstar added', 'Roster updated successfully.', 'success');
  };

  const updateSuperstar = (id, field, value) => {
    updateStateList('roster', (roster) => roster.map((star) => (star.id === id ? { ...star, [field]: value } : star)));
  };

  const removeSuperstar = (id) => {
    updateStateList('roster', (roster) => roster.filter((star) => star.id !== id));
    updateStateList('titles', (titles) => titles.map((title) => (title.holderId === id ? { ...title, holderId: null } : title)));
    showToast('Roster updated', 'The superstar was removed from this universe.', 'info');
  };

  const updateTitle = (id, field, value) => {
    updateStateList('titles', (titles) => titles.map((title) => (title.id === id ? { ...title, [field]: value || null } : title)));
  };

  const addRivalry = (event) => {
    event.preventDefault();
    if (!rivalryForm.superstarA.trim() || !rivalryForm.superstarB.trim()) return;
    updateStateList('rivalries', (rivalries) => [
      ...rivalries,
      {
        id: crypto.randomUUID(),
        ...rivalryForm,
        brandId: rivalryForm.brandId || null,
        superstarA: rivalryForm.superstarA.trim(),
        superstarB: rivalryForm.superstarB.trim(),
        notes: rivalryForm.notes.trim(),
      },
    ]);
    setRivalryForm(defaultRivalryForm);
    showToast('Rivalry added', 'Storyline tracker updated.', 'success');
  };

  const removeRivalry = (id) => {
    updateStateList('rivalries', (rivalries) => rivalries.filter((rivalry) => rivalry.id !== id));
  };

  const updateMatchDraft = (id, field, value) => {
    setMatchDrafts((matches) => matches.map((match) => (match.id === id ? { ...match, [field]: value } : match)));
  };

  const addMatchDraft = () => setMatchDrafts((matches) => [...matches, createMatchDraft()]);
  const removeMatchDraft = (id) => setMatchDrafts((matches) => matches.filter((match) => match.id !== id));

  const addCard = (event) => {
    event.preventDefault();
    if (!cardForm.showName.trim() || !cardForm.episodeName.trim()) return;
    updateStateList('cards', (cards) => [
      {
        id: crypto.randomUUID(),
        showName: cardForm.showName.trim(),
        episodeName: cardForm.episodeName.trim(),
        imageUrl: cardForm.imageUrl.trim() || createShowArt(cardForm.showName.trim(), cardForm.episodeName.trim(), '#7c3aed'),
        matches: matchDrafts.filter((match) => match.participants.trim()).map((match) => ({ ...match })),
      },
      ...cards,
    ]);
    setCardForm(defaultCardForm);
    setMatchDrafts([createMatchDraft()]);
    showToast('Show card saved', 'Your weekly card is now part of this universe.', 'success');
  };

  const removeCard = (id) => {
    updateStateList('cards', (cards) => cards.filter((card) => card.id !== id));
  };

  const exportUniverse = () => {
    downloadFile(`wwe2k26-${activeSlotName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'universe'}-export.json`, JSON.stringify(state, null, 2));
    showToast('Export ready', 'Universe JSON downloaded.', 'success');
  };

  const resetUniverse = () => {
    const reset = freshState();
    setState(reset);
    saveState(STORAGE_KEY, reset);
    setAuthMessage('Universe reset to demo data.');
    showModal('Universe reset', 'Demo data has been restored for this slot.', 'success');
  };

  const importUniverse = async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setState(normalizeState(parsed));
      setAuthMessage('Universe imported successfully.');
      showModal('Import complete', 'Your universe JSON imported correctly.', 'success');
    } catch {
      setAuthMessage('Import failed. Please use a valid planner JSON export.');
      showModal('Import failed', 'That file could not be read as a valid planner export.', 'error');
    } finally {
      event.target.value = '';
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    const username = authForm.username.trim();

    if (!isValidUsername(username)) {
      const message = 'Choose a username between 3 and 24 characters using letters, numbers, underscores, or dashes.';
      setAuthMessage(message);
      showModal('Username not valid', message, 'error');
      return;
    }

    setAuthBusy(true);
    setAuthMessage('');

    try {
      const response = authMode === 'register'
        ? await api.register({ username, password: authForm.password })
        : await api.login({ username, password: authForm.password });

      const nextSession = response?.user ? { user: response.user } : null;
      setSession(nextSession);
      setSaveSlots([]);
      setActiveSlotId(null);
      setCloudStatus(nextSession ? 'Syncing cloud save…' : 'Signed out');
      setAuthMessage(authMode === 'register' ? 'Profile created.' : 'Welcome back.');
      setAuthForm({ username: '', password: '' });
      showModal(
        authMode === 'register' ? 'Profile created successfully' : 'Signed in successfully',
        authMode === 'register'
          ? `Your username @${response.user.username} is ready. No email address was stored.`
          : `Welcome back, @${response.user.username}. Your active save slots will load now.`,
        'success'
      );
    } catch (error) {
      const message = getErrorMessage(error, 'Authentication failed.');
      const extraDetails = error?.details || (message.includes('package dependencies') ? 'If this is on Vercel, make sure bcryptjs and jose are installed and redeployed.' : '');
      setAuthMessage(message);
      showModal('Could not complete authentication', message, 'error', extraDetails);
    } finally {
      setAuthBusy(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await api.logout();
      setSession(null);
      setSaveSlots([]);
      setActiveSlotId(null);
      setCloudStatus('Signed out');
      setAuthMessage('Signed out. Your guest browser copy is still available on this device.');
      showToast('Signed out', 'Guest mode is still available on this browser.', 'info');
    } catch (error) {
      const message = getErrorMessage(error, 'Could not sign out.');
      setAuthMessage(message);
      showModal('Sign-out failed', message, 'error');
    }
  };

  const handleCreateSlot = async (event) => {
    event.preventDefault();
    if (!session?.user || !slotName.trim()) return;

    const trimmedName = slotName.trim();
    if (saveSlots.some((slot) => slot.slot_name.toLowerCase() === trimmedName.toLowerCase())) {
      const message = 'Choose a different slot name.';
      setAuthMessage(message);
      showModal('Duplicate slot name', message, 'error');
      return;
    }

    setSlotBusy(true);
    const created = await createCloudSlot(trimmedName, freshState());
    if (created) {
      setSaveSlots((current) => [created, ...current].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
      skipNextCloudSave.current = true;
      setActiveSlotId(created.id);
      setState(normalizeState(created.data));
      setCloudStatus(`Created ${created.slot_name}`);
      setSlotName('');
      showModal('New save slot created', `${created.slot_name} is ready for its own brand split and roster.`, 'success');
    }
    setSlotBusy(false);
  };

  const handleSelectSlot = (slotId) => {
    if (slotId === activeSlotId) return;
    const slot = saveSlots.find((entry) => entry.id === slotId);
    if (!slot) return;

    skipNextCloudSave.current = true;
    setActiveSlotId(slot.id);
    setState(normalizeState(slot.data));
    setCloudStatus(`Loaded ${slot.slot_name}`);
    showToast('Save slot loaded', `${slot.slot_name} is now active.`, 'success');
  };

  const handleDeleteSlot = async (slotId) => {
    if (!session?.user?.id) return;
    if (saveSlots.length <= 1) {
      const message = 'Keep at least one universe slot.';
      setAuthMessage(message);
      showModal('Cannot delete final slot', message, 'error');
      return;
    }

    const slot = saveSlots.find((entry) => entry.id === slotId);
    if (!slot) return;

    setSlotBusy(true);
    try {
      await api.deleteUniverse({ id: slotId });
      const nextSlots = saveSlots.filter((entry) => entry.id !== slotId);
      setSaveSlots(nextSlots);

      if (activeSlotId === slotId && nextSlots.length) {
        skipNextCloudSave.current = true;
        setActiveSlotId(nextSlots[0].id);
        setState(normalizeState(nextSlots[0].data));
        setCloudStatus(`Loaded ${nextSlots[0].slot_name}`);
      }

      setAuthMessage(`Deleted ${slot.slot_name}.`);
      showToast('Save slot deleted', `${slot.slot_name} was removed.`, 'info');
    } catch (error) {
      const message = getErrorMessage(error, 'Could not delete that slot.');
      setAuthMessage(message);
      showModal('Delete failed', message, 'error');
    } finally {
      setSlotBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <Toast toast={toast} />
      <Modal modal={modal} onClose={() => setModal(null)} />

      <header className="hero">
        <div>
          <span className="eyebrow">WWE 2K26 companion MVP</span>
          <h1>Universe &amp; Creations Planner</h1>
          <p>
            Manage brand splits, champions, rivalries, and weekly cards in one place. This build adds custom username auth,
            multiple cloud slots, visual media cards, and clearer success/error messaging.
          </p>
        </div>
        <div className="hero-actions">
          <button onClick={exportUniverse} type="button">Export JSON</button>
          <label className="button import-button">
            <span>Import JSON</span>
            <input type="file" accept="application/json" onChange={importUniverse} hidden />
          </label>
          <button className="danger" onClick={resetUniverse} type="button">Reset Demo Data</button>
        </div>
      </header>

      <div className="grid two-column auth-layout">
        <SectionCard title="Player Profiles" subtitle="Use a username and password for cloud saves. Guests can still use the app locally.">
          <AuthPanel
            session={session}
            authMode={authMode}
            setAuthMode={setAuthMode}
            authForm={authForm}
            setAuthForm={setAuthForm}
            authBusy={authBusy}
            authMessage={authMessage}
            onSubmit={handleAuthSubmit}
            onSignOut={handleSignOut}
            cloudStatus={cloudStatus}
            activeSlotName={activeSlotName}
          />
        </SectionCard>

        <SectionCard title="Save Slots" subtitle="Keep separate universes for WWE, AEW-style setups, legends eras, or custom promotions.">
          <SlotPanel
            session={session}
            slots={saveSlots}
            activeSlotId={activeSlotId}
            slotName={slotName}
            setSlotName={setSlotName}
            onCreateSlot={handleCreateSlot}
            onSelectSlot={handleSelectSlot}
            onDeleteSlot={handleDeleteSlot}
            slotBusy={slotBusy}
          />
        </SectionCard>
      </div>

      <section className="stats-grid">
        <article><strong>{summary.brands}</strong><span>Brands</span></article>
        <article><strong>{summary.superstars}</strong><span>Superstars</span></article>
        <article><strong>{summary.assigned}</strong><span>Assigned to Brands</span></article>
        <article><strong>{summary.champions}</strong><span>Assigned Titles</span></article>
        <article><strong>{summary.rivalries}</strong><span>Rivalries</span></article>
        <article><strong>{summary.cards}</strong><span>Show Cards</span></article>
      </section>

      <div className="grid two-column">
        <SectionCard
          title="Brands"
          subtitle="Create shows or promotions, add artwork, and track each roster bucket."
          actions={
            <form className="inline-form" onSubmit={addBrand}>
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="New brand" />
              <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} aria-label="Brand color" />
              <input value={brandImageUrl} onChange={(e) => setBrandImageUrl(e.target.value)} placeholder="Brand image URL" />
              <button type="submit">Add</button>
            </form>
          }
        >
          <BrandBoard brands={state.brands} rosterByBrand={rosterByBrand} onImageChange={(id, value) => updateBrand(id, 'imageUrl', value)} />
        </SectionCard>

        <SectionCard title="Roster" subtitle="Assign superstars, check who is on a brand, and add render URLs when you have them.">
          <form className="inline-form" onSubmit={addSuperstar}>
            <input value={rosterName} onChange={(e) => setRosterName(e.target.value)} placeholder="Add superstar or team" />
            <input value={rosterImageUrl} onChange={(e) => setRosterImageUrl(e.target.value)} placeholder="Superstar image URL" />
            <button type="submit">Add</button>
          </form>

          <div className="lookup-panel">
            <strong>Brand assignment check</strong>
            <div className="split-inputs">
              <select value={assignmentLookupId} onChange={(event) => setAssignmentLookupId(event.target.value)}>
                <option value="">Select a wrestler</option>
                {state.roster.map((star) => <option key={star.id} value={star.id}>{star.name}</option>)}
              </select>
              <div className="lookup-result">
                {assignmentLookupStar
                  ? assignmentLookupStar.brandId
                    ? `${assignmentLookupStar.name} is assigned to ${brandMap[assignmentLookupStar.brandId]?.name || 'Unknown brand'} and ready for that show package.`
                    : `${assignmentLookupStar.name} is currently a free agent and can be drafted anywhere.`
                  : 'Pick a wrestler to check their brand status.'}
              </div>
            </div>
          </div>

          <div className="roster-grid">
            {state.roster.map((star) => (
              <article key={star.id} className="visual-card roster-card">
                <MediaThumb src={star.imageUrl} alt={star.name} compact logo={star.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()} />
                <div className="visual-content">
                  <div className="mini-card-top">
                    <strong className="display-name superstar-name">{star.name}</strong>
                    <span className={`badge ${star.brandId ? 'brand-badge' : 'neutral'}`} style={star.brandId ? { background: `${brandMap[star.brandId]?.color || '#475569'}22`, color: brandMap[star.brandId]?.color || '#e2e8f0', borderColor: `${brandMap[star.brandId]?.color || '#475569'}66` } : undefined}>{star.brandId ? brandMap[star.brandId]?.name : 'Free Agent'}</span>
                  </div>
                  <div className="split-inputs compact-grid">
                    <select value={star.brandId || ''} onChange={(e) => updateSuperstar(star.id, 'brandId', e.target.value || null)}>
                      <option value="">Free Agent</option>
                      {state.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                    </select>
                    <select value={star.alignment} onChange={(e) => updateSuperstar(star.id, 'alignment', e.target.value)}>
                      <option>Face</option>
                      <option>Heel</option>
                      <option>Tweener</option>
                    </select>
                  </div>
                  <div className="split-inputs compact-grid">
                    <select value={star.division} onChange={(e) => updateSuperstar(star.id, 'division', e.target.value)}>
                      <option>Main Event</option>
                      <option>Midcard</option>
                      <option>Women</option>
                      <option>Tag</option>
                      <option>Legends</option>
                    </select>
                    <input value={star.imageUrl || ''} onChange={(e) => updateSuperstar(star.id, 'imageUrl', e.target.value)} placeholder="Image URL" />
                  </div>
                  <div className="roster-meta">
                    <span>{star.alignment}</span>
                    <span>{star.division}</span>
                  </div>
                  <button className="danger ghost" type="button" onClick={() => removeSuperstar(star.id)}>Remove</button>
                </div>
              </article>
            ))}
          </div>
          {freeAgents.length ? <p className="muted">Free agents: {freeAgents.map((star) => star.name).join(', ')}</p> : null}
        </SectionCard>
      </div>

      <div className="grid two-column">
        <SectionCard title="Championships" subtitle="Assign titles to brands and champions.">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Brand</th>
                  <th>Champion</th>
                </tr>
              </thead>
              <tbody>
                {state.titles.map((title) => (
                  <tr key={title.id}>
                    <td>{title.name}</td>
                    <td>
                      <select value={title.brandId || ''} onChange={(e) => updateTitle(title.id, 'brandId', e.target.value)}>
                        <option value="">Any brand</option>
                        {state.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                      </select>
                    </td>
                    <td>
                      <select value={title.holderId || ''} onChange={(e) => updateTitle(title.id, 'holderId', e.target.value)}>
                        <option value="">Vacant</option>
                        {state.roster.map((star) => <option key={star.id} value={star.id}>{star.name}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard title="Rivalries" subtitle="Track active feuds and storyline beats.">
          <form className="stack-form" onSubmit={addRivalry}>
            <div className="split-inputs">
              <input placeholder="Superstar A" value={rivalryForm.superstarA} onChange={(e) => setRivalryForm((f) => ({ ...f, superstarA: e.target.value }))} />
              <input placeholder="Superstar B" value={rivalryForm.superstarB} onChange={(e) => setRivalryForm((f) => ({ ...f, superstarB: e.target.value }))} />
            </div>
            <div className="split-inputs">
              <select value={rivalryForm.brandId} onChange={(e) => setRivalryForm((f) => ({ ...f, brandId: e.target.value }))}>
                <option value="">Any brand</option>
                {state.brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
              <select value={rivalryForm.intensity} onChange={(e) => setRivalryForm((f) => ({ ...f, intensity: e.target.value }))}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>PPV</option>
              </select>
            </div>
            <textarea placeholder="Story notes" value={rivalryForm.notes} onChange={(e) => setRivalryForm((f) => ({ ...f, notes: e.target.value }))} />
            <button type="submit">Add Rivalry</button>
          </form>
          <div className="card-list">
            {state.rivalries.map((rivalry) => (
              <article key={rivalry.id} className="mini-card">
                <div className="mini-card-top">
                  <strong>{rivalry.superstarA} vs {rivalry.superstarB}</strong>
                  <span className={`badge ${rivalry.intensity.toLowerCase()}`}>{rivalry.intensity}</span>
                </div>
                <p>{rivalry.notes || 'No notes yet.'}</p>
                <small>{rivalry.brandId ? brandMap[rivalry.brandId]?.name : 'Cross-brand'}</small>
                <button className="danger ghost" type="button" onClick={() => removeRivalry(rivalry.id)}>Delete</button>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="grid two-column">
        <SectionCard title="Weekly Card Builder" subtitle="Draft a show, add a poster image, and save the matches as a reusable weekly card.">
          <form className="stack-form" onSubmit={addCard}>
            <div className="split-inputs">
              <input placeholder="Show name" value={cardForm.showName} onChange={(e) => setCardForm((f) => ({ ...f, showName: e.target.value }))} />
              <input placeholder="Episode or PPV" value={cardForm.episodeName} onChange={(e) => setCardForm((f) => ({ ...f, episodeName: e.target.value }))} />
            </div>
            <input placeholder="Poster / PPV image URL" value={cardForm.imageUrl} onChange={(e) => setCardForm((f) => ({ ...f, imageUrl: e.target.value }))} />
            {matchDrafts.map((match) => (
              <div key={match.id} className="match-builder">
                <div className="split-inputs">
                  <select value={match.matchType} onChange={(e) => updateMatchDraft(match.id, 'matchType', e.target.value)}>
                    <option>Singles</option>
                    <option>Tag Team</option>
                    <option>Triple Threat</option>
                    <option>Fatal 4-Way</option>
                    <option>Battle Royal</option>
                  </select>
                  <select value={match.stipulation} onChange={(e) => updateMatchDraft(match.id, 'stipulation', e.target.value)}>
                    <option>Standard</option>
                    <option>I Quit</option>
                    <option>Inferno</option>
                    <option>Dumpster</option>
                    <option>3 Stages of Hell</option>
                    <option>Falls Count Anywhere</option>
                  </select>
                </div>
                <input placeholder="Participants, e.g. Gunther vs Randy Orton" value={match.participants} onChange={(e) => updateMatchDraft(match.id, 'participants', e.target.value)} />
                {matchDrafts.length > 1 ? <button className="danger ghost" type="button" onClick={() => removeMatchDraft(match.id)}>Remove Match</button> : null}
              </div>
            ))}
            <div className="section-actions left">
              <button type="button" className="secondary" onClick={addMatchDraft}>Add Match Slot</button>
              <button type="submit">Save Card</button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Saved Cards" subtitle="Use these as weekly booking references or export the universe snapshot.">
          <div className="card-list visual-list">
            {state.cards.map((card) => (
              <article key={card.id} className="visual-card show-card">
                <MediaThumb src={card.imageUrl} alt={`${card.showName} ${card.episodeName}`} />
                <div className="visual-content">
                  <div className="mini-card-top">
                    <strong>{card.showName}</strong>
                    <span className="badge neutral">{card.episodeName}</span>
                  </div>
                  <ol>
                    {card.matches.map((match) => (
                      <li key={match.id}>
                        <span>{match.participants}</span>
                        <small>{match.matchType} · {match.stipulation}</small>
                      </li>
                    ))}
                  </ol>
                  <input value={card.imageUrl || ''} onChange={(e) => updateStateList('cards', (cards) => cards.map((entry) => entry.id === card.id ? { ...entry, imageUrl: e.target.value } : entry))} placeholder="Poster image URL" />
                  <button className="danger ghost" type="button" onClick={() => removeCard(card.id)}>Delete Card</button>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Free image source ideas" subtitle="Use these when you want legitimate artwork sources for wrestler photos, logos, brand art, and generic PPV backgrounds.">
        <SourceLibrary />
      </SectionCard>

      <footer className="footer-note">
        <p>
          Built as an MVP starter. This version includes custom username-based profiles, multiple cloud save slots, visual media cards,
          and guest mode for quick testing.
        </p>
        <p>
          Current assigned champions:{' '}
          {state.titles
            .filter((title) => title.holderId)
            .map((title) => `${title.name} — ${superstarMap[title.holderId]?.name || 'Unknown'}`)
            .join(' · ') || 'None yet'}
        </p>
      </footer>
    </div>
  );
}
