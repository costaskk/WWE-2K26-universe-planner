import { useEffect, useMemo, useState } from 'react';
import SectionCard from './components/SectionCard';
import {
  defaultBrands,
  defaultCards,
  defaultRoster,
  defaultRivalries,
  defaultTitles,
} from './data';
import { downloadFile, loadState, saveState } from './utils';

const STORAGE_KEY = 'wwe2k26-universe-planner';

const freshState = () => ({
  brands: defaultBrands,
  roster: defaultRoster,
  titles: defaultTitles,
  rivalries: defaultRivalries,
  cards: defaultCards,
});

export default function App() {
  const [state, setState] = useState(() => loadState(STORAGE_KEY, freshState()));
  const [brandName, setBrandName] = useState('');
  const [brandColor, setBrandColor] = useState('#7c3aed');
  const [rosterName, setRosterName] = useState('');
  const [rivalryForm, setRivalryForm] = useState({ superstarA: '', superstarB: '', brandId: '', intensity: 'Medium', notes: '' });
  const [cardForm, setCardForm] = useState({ showName: '', episodeName: '' });
  const [matchDrafts, setMatchDrafts] = useState([{ id: crypto.randomUUID(), matchType: 'Singles', stipulation: 'Standard', participants: '' }]);

  useEffect(() => {
    saveState(STORAGE_KEY, state);
  }, [state]);

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
    setRivalryForm({ superstarA: '', superstarB: '', brandId: '', intensity: 'Medium', notes: '' });
  };

  const removeRivalry = (id) => {
    updateStateList('rivalries', (rivalries) => rivalries.filter((rivalry) => rivalry.id !== id));
  };

  const updateMatchDraft = (id, field, value) => {
    setMatchDrafts((matches) => matches.map((match) => (match.id === id ? { ...match, [field]: value } : match)));
  };

  const addMatchDraft = () => {
    setMatchDrafts((matches) => [
      ...matches,
      { id: crypto.randomUUID(), matchType: 'Singles', stipulation: 'Standard', participants: '' },
    ]);
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
    setCardForm({ showName: '', episodeName: '' });
    setMatchDrafts([{ id: crypto.randomUUID(), matchType: 'Singles', stipulation: 'Standard', participants: '' }]);
  };

  const removeCard = (id) => {
    updateStateList('cards', (cards) => cards.filter((card) => card.id !== id));
  };

  const exportUniverse = () => {
    downloadFile('wwe2k26-universe-export.json', JSON.stringify(state, null, 2));
  };

  const resetUniverse = () => {
    const reset = freshState();
    setState(reset);
    saveState(STORAGE_KEY, reset);
  };

  const importUniverse = async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    const text = await file.text();
    const parsed = JSON.parse(text);
    setState(parsed);
    event.target.value = '';
  };

  return (
    <div className="app-shell">
      <header className="hero">
        <div>
          <span className="eyebrow">WWE 2K26 companion MVP</span>
          <h1>Universe & Creations Planner</h1>
          <p>
            Manage brand splits, champions, rivalries, and weekly cards in one place. This starter build uses localStorage,
            so it works instantly with no backend.
          </p>
        </div>
        <div className="hero-actions">
          <button onClick={exportUniverse}>Export JSON</button>
          <label className="button secondary">
            Import JSON
            <input type="file" accept="application/json" onChange={importUniverse} hidden />
          </label>
          <button className="danger" onClick={resetUniverse}>Reset Demo Data</button>
        </div>
      </header>

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
                <span className="color-dot" style={{ background: brand.color }} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Roster" subtitle="Set alignment, division, and brand split for every superstar.">
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
                    <td><button className="danger ghost" onClick={() => removeSuperstar(star.id)}>Remove</button></td>
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
                <button className="danger ghost" onClick={() => removeRivalry(rivalry.id)}>Delete</button>
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
                <button className="danger ghost" onClick={() => removeCard(card.id)}>Delete Card</button>
              </article>
            ))}
          </div>
        </SectionCard>
      </div>

      <footer className="footer-note">
        <p>
          Built as an MVP starter. Next upgrades: user accounts, shared universes, draft automation, creation collections, mod compatibility, and printable exports.
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
