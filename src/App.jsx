import { useEffect, useMemo, useRef, useState } from 'react';
import SectionCard from './components/SectionCard';
import {
  defaultBrands,
  defaultCards,
  defaultRoster,
  defaultRivalries,
  defaultTitles,
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

const defaultCardForm = { showName: '', episodeName: '' };

const createMatchDraft = () => ({
  id: crypto.randomUUID(),
  matchType: 'Singles',
  stipulation: 'Standard',
  participants: '',
});

function normalizeState(input) {
  const base = freshState();

  if (!input || typeof input !== 'object') {
    return base;
  }

  return {
    brands: Array.isArray(input.brands) ? input.brands : base.brands,
    roster: Array.isArray(input.roster) ? input.roster : base.roster,
    titles: Array.isArray(input.titles) ? input.titles : base.titles,
    rivalries: Array.isArray(input.rivalries) ? input.rivalries : base.rivalries,
    cards: Array.isArray(input.cards) ? input.cards : base.cards,
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
          <span className="status-pill">{cloudStatus}</span>
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
        Usernames must be 3 to 24 characters and can use letters, numbers, underscores, or dashes.
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
              <article
                key={slot.id}
                className={`slot-card ${slot.id === activeSlotId ? 'active' : ''}`}
              >
                <div>
                  <strong>{slot.slot_name}</strong>
                  <p>Updated {formatTimestamp(slot.updated_at)}</p>
                </div>
                <div className="slot-actions">
                  <button type="button" className={slot.id === activeSlotId ? '' : 'secondary'} onClick={() => onSelectSlot(slot.id)}>
                    {slot.id === activeSlotId ? 'Active' : 'Open'}
                  </button>
                  <button
                    type="button"
                    className="danger ghost"
                    disabled={slots.length <= 1 || slotBusy}
                    onClick={() => onDeleteSlot(slot.id)}
                  >
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

export default function App() {
  const [state, setState] = useState(() => loadState(STORAGE_KEY, freshState()));
  const [brandName, setBrandName] = useState('');
  const [brandColor, setBrandColor] = useState('#7c3aed');
  const [rosterName, setRosterName] = useState('');
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

  const skipNextCloudSave = useRef(false);
  const cloudHydratedForUser = useRef(null);

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
        setAuthMessage(error.message || 'Could not reach the profile server.');
        setCloudStatus('Profiles unavailable');
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
      } catch (error) {
        setCloudStatus('Cloud load failed');
        setAuthMessage(error.message || 'Could not load your universes.');
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

  const freeAgents = useMemo(
    () => state.roster.filter((star) => !star.brandId),
    [state.roster]
  );

  const summary = useMemo(() => {
    const champions = state.titles.filter((title) => title.holderId).length;
    return {
      brands: state.brands.length,
      superstars: state.roster.length,
      rivalries: state.rivalries.length,
      cards: state.cards.length,
      champions,
    };
  }, [state]);

  const activeSlotName = useMemo(
    () => saveSlots.find((slot) => slot.id === activeSlotId)?.slot_name || DEFAULT_SLOT_NAME,
    [saveSlots, activeSlotId]
  );

  async function createCloudSlot(name, sourceState = freshState()) {
    if (!session?.user?.id) return null;

    try {
      const response = await api.createUniverse({
        slotName: name.trim(),
        data: normalizeState(sourceState),
      });
      return response.universe;
    } catch (error) {
      setAuthMessage(error.message || 'Could not create save slot.');
      setCloudStatus('Cloud save failed');
      return null;
    }
  }

  async function saveUniverseToCloud(slotId, nextState, successLabel = 'All changes saved') {
    if (!session?.user?.id || !slotId) return;

    setCloudStatus('Saving to cloud…');

    try {
      const response = await api.saveUniverse({
        id: slotId,
        data: normalizeState(nextState),
      });
      const saved = response.universe;
      setSaveSlots((current) => {
        const next = current.some((slot) => slot.id === saved.id)
          ? current.map((slot) => (slot.id === saved.id ? saved : slot))
          : [saved, ...current];
        return [...next].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      });
      setCloudStatus(successLabel);
    } catch (error) {
      setCloudStatus('Cloud save failed');
      setAuthMessage(error.message || 'Could not save your universe.');
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
      { id: crypto.randomUUID(), name: brandName.trim(), color: brandColor },
    ]);
    setBrandName('');
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
      },
    ]);
    setRosterName('');
  };

  const updateSuperstar = (id, field, value) => {
    updateStateList('roster', (roster) => roster.map((star) => (star.id === id ? { ...star, [field]: value } : star)));
  };

  const removeSuperstar = (id) => {
    updateStateList('roster', (roster) => roster.filter((star) => star.id !== id));
    updateStateList('titles', (titles) => titles.map((title) => (title.holderId === id ? { ...title, holderId: null } : title)));
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
  };

  const removeRivalry = (id) => {
    updateStateList('rivalries', (rivalries) => rivalries.filter((rivalry) => rivalry.id !== id));
  };

  const updateMatchDraft = (id, field, value) => {
    setMatchDrafts((matches) => matches.map((match) => (match.id === id ? { ...match, [field]: value } : match)));
  };

  const addMatchDraft = () => {
    setMatchDrafts((matches) => [...matches, createMatchDraft()]);
  };

  const removeMatchDraft = (id) => {
    setMatchDrafts((matches) => matches.filter((match) => match.id !== id));
  };

  const addCard = (event) => {
    event.preventDefault();
    if (!cardForm.showName.trim() || !cardForm.episodeName.trim()) return;
    updateStateList('cards', (cards) => [
      {
        id: crypto.randomUUID(),
        showName: cardForm.showName.trim(),
        episodeName: cardForm.episodeName.trim(),
        matches: matchDrafts.filter((match) => match.participants.trim()).map((match) => ({ ...match })),
      },
      ...cards,
    ]);
    setCardForm(defaultCardForm);
    setMatchDrafts([createMatchDraft()]);
  };

  const removeCard = (id) => {
    updateStateList('cards', (cards) => cards.filter((card) => card.id !== id));
  };

  const exportUniverse = () => {
    downloadFile(`wwe2k26-${activeSlotName.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'universe'}-export.json`, JSON.stringify(state, null, 2));
  };

  const resetUniverse = () => {
    const reset = freshState();
    setState(reset);
    saveState(STORAGE_KEY, reset);
    setAuthMessage('Universe reset to demo data.');
  };

  const importUniverse = async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setState(normalizeState(parsed));
      setAuthMessage('Universe imported successfully.');
    } catch (error) {
      setAuthMessage('Import failed. Please use a valid planner JSON export.');
    } finally {
      event.target.value = '';
    }
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();

    const username = authForm.username.trim();

    if (!isValidUsername(username)) {
      setAuthMessage('Choose a username between 3 and 24 characters using letters, numbers, underscores, or dashes.');
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
    } catch (error) {
      setAuthMessage(error.message || 'Authentication failed.');
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
    } catch (error) {
      setAuthMessage(error.message || 'Could not sign out.');
    }
  };

  const handleCreateSlot = async (event) => {
    event.preventDefault();
    if (!session?.user || !slotName.trim()) return;

    const trimmedName = slotName.trim();
    if (saveSlots.some((slot) => slot.slot_name.toLowerCase() === trimmedName.toLowerCase())) {
      setAuthMessage('Choose a different slot name.');
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
  };

  const handleDeleteSlot = async (slotId) => {
    if (!session?.user?.id) return;
    if (saveSlots.length <= 1) {
      setAuthMessage('Keep at least one universe slot.');
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
    } catch (error) {
      setAuthMessage(error.message || 'Could not delete that slot.');
    } finally {
      setSlotBusy(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">WWE 2K26 companion MVP</span>
          <h1>Universe &amp; Creations Planner</h1>
          <p>
            Manage brand splits, champions, rivalries, and weekly cards in one place. This version now supports simple
            usernames, multiple save slots, and synced profiles without storing personal email addresses.
          </p>
        </div>
        <div className="hero-actions">
          <button onClick={exportUniverse} type="button">Export JSON</button>
          <label className="button secondary">
            Import JSON
            <input type="file" accept="application/json" onChange={importUniverse} hidden />
          </label>
          <button className="danger" onClick={resetUniverse} type="button">Reset Demo Data</button>
        </div>
      </header>

      <div className="grid two-column auth-layout">
        <SectionCard
          title="Player Profiles"
          subtitle="Use a username and password for cloud saves. Guests can still use the app locally."
        >
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

        <SectionCard
          title="Save Slots"
          subtitle="Keep separate universes for WWE, AEW-style setups, legends eras, or custom promotions."
        >
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
        <article><strong>{summary.champions}</strong><span>Assigned Titles</span></article>
        <article><strong>{summary.rivalries}</strong><span>Rivalries</span></article>
        <article><strong>{summary.cards}</strong><span>Show Cards</span></article>
      </section>

      <div className="grid two-column">
        <SectionCard
          title="Brands"
          subtitle="Create shows or promotions and track each roster bucket."
          actions={
            <form className="inline-form" onSubmit={addBrand}>
              <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="New brand" />
              <input type="color" value={brandColor} onChange={(e) => setBrandColor(e.target.value)} aria-label="Brand color" />
              <button type="submit">Add</button>
            </form>
          }
        >
          <div className="brand-list">
            {rosterByBrand.map((brand) => (
              <div key={brand.id} className="brand-pill" style={{ borderColor: brand.color }}>
                <div>
                  <strong>{brand.name}</strong>
                  <span>{brand.stars.length} assigned</span>
                </div>
                <div className="brand-pill">
                  <span className="color-dot" style={{ background: brand.color }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Roster" subtitle="Assign superstars, factions, and teams to brands and divisions.">
          <form className="inline-form" onSubmit={addSuperstar}>
            <input value={rosterName} onChange={(e) => setRosterName(e.target.value)} placeholder="Add superstar or team" />
            <button type="submit">Add</button>
          </form>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Alignment</th>
                  <th>Division</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {state.roster.map((star) => (
                  <tr key={star.id}>
                    <td>{star.name}</td>
                    <td>
                      <select value={star.brandId || ''} onChange={(e) => updateSuperstar(star.id, 'brandId', e.target.value || null)}>
                        <option value="">Free Agent</option>
                        {state.brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={star.alignment} onChange={(e) => updateSuperstar(star.id, 'alignment', e.target.value)}>
                        <option>Face</option>
                        <option>Heel</option>
                        <option>Tweener</option>
                      </select>
                    </td>
                    <td>
                      <select value={star.division} onChange={(e) => updateSuperstar(star.id, 'division', e.target.value)}>
                        <option>Main Event</option>
                        <option>Midcard</option>
                        <option>Women</option>
                        <option>Tag</option>
                        <option>Legends</option>
                      </select>
                    </td>
                    <td><button className="danger ghost" type="button" onClick={() => removeSuperstar(star.id)}>Remove</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                        {state.brands.map((brand) => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select value={title.holderId || ''} onChange={(e) => updateTitle(title.id, 'holderId', e.target.value)}>
                        <option value="">Vacant</option>
                        {state.roster.map((star) => (
                          <option key={star.id} value={star.id}>{star.name}</option>
                        ))}
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
        <SectionCard title="Weekly Card Builder" subtitle="Draft a show and save the matches as a reusable weekly card.">
          <form className="stack-form" onSubmit={addCard}>
            <div className="split-inputs">
              <input placeholder="Show name" value={cardForm.showName} onChange={(e) => setCardForm((f) => ({ ...f, showName: e.target.value }))} />
              <input placeholder="Episode or PPV" value={cardForm.episodeName} onChange={(e) => setCardForm((f) => ({ ...f, episodeName: e.target.value }))} />
            </div>
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
                <input
                  placeholder="Participants, e.g. Gunther vs Randy Orton"
                  value={match.participants}
                  onChange={(e) => updateMatchDraft(match.id, 'participants', e.target.value)}
                />
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
          <div className="card-list">
            {state.cards.map((card) => (
              <article key={card.id} className="mini-card">
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
                <button className="danger ghost" type="button" onClick={() => removeCard(card.id)}>Delete Card</button>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <footer className="footer-note">
        <p>
          Built as an MVP starter. This version includes username-based profiles, multiple cloud save slots, and browser-only
          guest mode for quick testing.
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
