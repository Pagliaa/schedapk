const TYPE_CHART = {
  typeless: { debolezza: [], resistenza: [], immunita: [] },
  normale: { debolezza: ['lotta'], resistenza: [], immunita: ['spettro'] },
  fuoco: { debolezza: ['acqua', 'terra', 'roccia'], resistenza: ['fuoco', 'erba', 'ghiaccio', 'coleottero', 'acciaio', 'folletto'], immunita: [] },
  acqua: { debolezza: ['erba', 'elettro'], resistenza: ['fuoco', 'acqua', 'ghiaccio', 'acciaio'], immunita: [] },
  erba: { debolezza: ['fuoco', 'ghiaccio', 'veleno', 'volante', 'coleottero'], resistenza: ['acqua', 'erba', 'elettro', 'terra'], immunita: [] },
  elettro: { debolezza: ['terra'], resistenza: ['elettro', 'volante', 'acciaio'], immunita: [] },
  ghiaccio: { debolezza: ['fuoco', 'lotta', 'roccia', 'acciaio'], resistenza: ['ghiaccio'], immunita: [] },
  lotta: { debolezza: ['volante', 'psico', 'folletto'], resistenza: ['coleottero', 'roccia', 'buio'], immunita: [] },
  veleno: { debolezza: ['terra', 'psico'], resistenza: ['erba', 'lotta', 'veleno', 'coleottero', 'folletto'], immunita: [] },
  terra: { debolezza: ['acqua', 'erba', 'ghiaccio'], resistenza: ['veleno', 'roccia'], immunita: ['elettro'] },
  volante: { debolezza: ['elettro', 'ghiaccio', 'roccia'], resistenza: ['erba', 'lotta', 'coleottero'], immunita: ['terra'] },
  psico: { debolezza: ['coleottero', 'spettro', 'buio'], resistenza: ['lotta', 'psico'], immunita: [] },
  coleottero: { debolezza: ['fuoco', 'volante', 'roccia'], resistenza: ['erba', 'lotta', 'terra'], immunita: [] },
  roccia: { debolezza: ['acqua', 'erba', 'lotta', 'terra', 'acciaio'], resistenza: ['normale', 'fuoco', 'veleno', 'volante'], immunita: [] },
  spettro: { debolezza: ['spettro', 'buio'], resistenza: ['veleno', 'coleottero'], immunita: ['normale', 'lotta'] },
  drago: { debolezza: ['ghiaccio', 'drago', 'folletto'], resistenza: ['fuoco', 'acqua', 'erba', 'elettro'], immunita: [] },
  buio: { debolezza: ['lotta', 'coleottero', 'folletto'], resistenza: ['spettro', 'buio'], immunita: ['psico'] },
  acciaio: { debolezza: ['fuoco', 'lotta', 'terra'], resistenza: ['normale', 'erba', 'ghiaccio', 'volante', 'psico', 'coleottero', 'roccia', 'drago', 'acciaio', 'folletto'], immunita: ['veleno'] },
  folletto: { debolezza: ['veleno', 'acciaio'], resistenza: ['lotta', 'coleottero', 'buio'], immunita: ['drago'] }
};

// --- Helper Functions ---

function poke_list() {
  const popup = document.getElementById("popupPokeList");
  popup.classList.toggle('hidden');
}

function typeEff(t1, t2) {
  const listRes = document.getElementById('res');
  const listDeb = document.getElementById('deb');
  const listImm = document.getElementById('imm');

  // Reset current lists
  [listRes, listDeb, listImm].forEach(el => el.innerHTML = '');

  const multipliers = {};
  Object.keys(TYPE_CHART).forEach(type => multipliers[type] = 1.0);

  // Apply modifiers
  [t1, t2].forEach(t => {
    const typeKey = t ? t.toLowerCase() : null;
    if (!typeKey || !TYPE_CHART[typeKey]) return;
    
    TYPE_CHART[typeKey].debolezza.forEach(type => multipliers[type] *= 2);
    TYPE_CHART[typeKey].resistenza.forEach(type => multipliers[type] *= 0.5);
    TYPE_CHART[typeKey].immunita.forEach(type => multipliers[type] *= 0);
  });

  // Populate UI
  for (const [type, value] of Object.entries(multipliers)) {
    if (value === 1) continue; // Skip neutral effectiveness

    const li = document.createElement('li');
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);

    if (value > 1) {
      li.textContent = `${typeName} (${value}x)`;
      listDeb.appendChild(li);
    } else if (value > 0 && value < 1) {
      li.textContent = `${typeName} (${value}x)`;
      listRes.appendChild(li);
    } else if (value === 0) {
      li.textContent = typeName;
      listImm.appendChild(li);
    }
  }
}

// --- Main Logic ---

async function loadPoke() {
  try {
    const response = await fetch('json/poke_list.json');
    const allPokemon = await response.json();

    const listContainer = document.getElementById('pokeList');
    const searchInput = document.getElementById('pokeSearch');
    const popup = document.getElementById("popupPokeList");

    const nameDisplay = document.getElementById('pokename');
    const nrDisplay = document.getElementById('pokenr');
    const type1Display = document.getElementById('type1');
    const type1Img = document.getElementById('type1-img');
    const type1Text = document.getElementById('type1-text');
    const type2Display = document.getElementById('type2');
    const type2Img = document.getElementById('type2-img');
    const type2Text = document.getElementById('type2-text');

    const renderList = (pokemonArray) => {
      listContainer.innerHTML = ''; 

      pokemonArray.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = item.pokemon;
        a.href = '#';

        a.addEventListener('click', (e) => {
          e.preventDefault();

          // Update Display
          nameDisplay.textContent = item.pokemon;
          nrDisplay.textContent = '# ' + String(item.nr).padStart(3, '0');

          // Update Types
          type1Display.className = `spa-type type-${item.tipo1.toLowerCase()}`;
          type1Text.textContent = item.tipo1;

          if (item.tipo2) {
            type2Display.className = `spa-type type-${item.tipo2.toLowerCase()}`;
            type2Text.textContent = item.tipo2;
            type2Display.classList.remove('hidden');
          } else {
            type2Display.classList.add('hidden');
          }

          // Trigger Automation
          typeEff(item.tipo1, item.tipo2);
          popup.classList.add('hidden');
        });

        li.appendChild(a);
        listContainer.appendChild(li);
      });
    };

    renderList(allPokemon);

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase();
      const filtered = allPokemon.filter(p => p.pokemon.toLowerCase().includes(query));
      renderList(filtered);
    });

  } catch (err) {
    console.error("Error loading Pokémon data:", err);
  }
}

// Global "Click Outside" Listener
window.addEventListener('click', (e) => {
  const popup = document.getElementById("popupPokeList");
  const trigger = document.getElementById("pokename").closest('button');

  if (!popup.classList.contains('hidden') && 
      !popup.contains(e.target) && 
      !trigger.contains(e.target)) {
    popup.classList.add('hidden');
  }
});

loadPoke();