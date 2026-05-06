const TYPE_CHART = {
  typeless: { weakness: [], resistance: [], immunity: [] },
  normal: { weakness: ['fighting'], resistance: [], immunity: ['ghost'] },
  fire: { weakness: ['water', 'ground', 'rock'], resistance: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immunity: [] },
  water: { weakness: ['grass', 'electric'], resistance: ['fire', 'water', 'ice', 'steel'], immunity: [] },
  grass: { weakness: ['fire', 'ice', 'poison', 'flying', 'bug'], resistance: ['water', 'grass', 'electric', 'ground'], immunity: [] },
  electric: { weakness: ['ground'], resistance: ['electric', 'flying', 'steel'], immunity: [] },
  ice: { weakness: ['fire', 'fighting', 'rock', 'steel'], resistance: ['ice'], immunity: [] },
  fighting: { weakness: ['flying', 'psico', 'fairy'], resistance: ['bug', 'rock', 'dark'], immunity: [] },
  poison: { weakness: ['ground', 'psico'], resistance: ['grass', 'fighting', 'poison', 'bug', 'fairy'], immunity: [] },
  ground: { weakness: ['water', 'grass', 'ice'], resistance: ['poison', 'rock'], immunity: ['electric'] },
  flying: { weakness: ['electric', 'ice', 'rock'], resistance: ['grass', 'fighting', 'bug'], immunity: ['ground'] },
  psico: { weakness: ['bug', 'ghost', 'dark'], resistance: ['fighting', 'psico'], immunity: [] },
  bug: { weakness: ['fire', 'flying', 'rock'], resistance: ['grass', 'fighting', 'ground'], immunity: [] },
  rock: { weakness: ['water', 'grass', 'fighting', 'ground', 'steel'], resistance: ['normal', 'fire', 'poison', 'flying'], immunity: [] },
  ghost: { weakness: ['ghost', 'dark'], resistance: ['poison', 'bug'], immunity: ['normal', 'fighting'] },
  dragon: { weakness: ['ice', 'dragon', 'fairy'], resistance: ['fire', 'water', 'grass', 'electric'], immunity: [] },
  dark: { weakness: ['fighting', 'bug', 'fairy'], resistance: ['ghost', 'dark'], immunity: ['psico'] },
  steel: { weakness: ['fire', 'fighting', 'ground'], resistance: ['normal', 'grass', 'ice', 'flying', 'psico', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immunity: ['poison'] },
  fairy: { weakness: ['poison', 'steel'], resistance: ['fighting', 'bug', 'dark'], immunity: ['dragon'] }
};

// --- Helper Functions ---

function poke_list() {
  const popup = document.getElementById("popupPokeList");
  popup.classList.toggle('hidden');
}

function img_change() {
  // 1. Open a popup asking for the URL
  const newUrl = prompt("Enter the new image link (URL):", "");

  // 2. Check if the user actually entered something (didn't click cancel)
  if (newUrl !== null && newUrl !== "") {
    const img = document.getElementById('poke-img');

    // 3. Update the image source
    img.src = newUrl;
  }
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

    TYPE_CHART[typeKey].weakness.forEach(type => multipliers[type] *= 2);
    TYPE_CHART[typeKey].resistance.forEach(type => multipliers[type] *= 0.5);
    TYPE_CHART[typeKey].immunity.forEach(type => multipliers[type] *= 0);
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

function addCircle(prefix) {
  // 1. Find the input with a name starting with the prefix to locate the correct container
  const firstInput = document.querySelector(`input[name^="${prefix}"]`);
  if (!firstInput) return;

  const container = firstInput.parentElement;
  const currentCount = container.querySelectorAll('input').length;

  // 2. Create the new checkbox
  const newCheckbox = document.createElement('input');
  newCheckbox.type = 'checkbox';
  newCheckbox.className = 'checkbox-round';

  // 3. Set the unique name (e.g., cb_str13)
  newCheckbox.name = `${prefix}${currentCount + 1}`;

  // 4. Append to the specific container
  container.appendChild(newCheckbox);
}

function removeCircle(prefix) {
  // Find the container holding the inputs for this specific stat
  const firstInput = document.querySelector(`input[name^="${prefix}"]`);
  if (!firstInput) return;

  const container = firstInput.parentElement;
  const checkboxes = container.querySelectorAll('input');

  // Only remove if there's more than 1 (keeps the UI from looking empty)
  if (checkboxes.length > 1) {
    container.removeChild(checkboxes[checkboxes.length - 1]);
  }
}

function rank_change() {
  var popup = document.getElementById("popupRank");
  popup.classList.toggle('hidden');
}

function toggleTypeEff() {
  const div = document.getElementById('div-type-eff');
  const btn = event.currentTarget; // Prende il bottone che ha scatenato l'evento

  div.classList.toggle('hidden');

  if (div.classList.contains('hidden')) {
    btn.textContent = 'Show';
  } else {
    btn.textContent = 'Hide';
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
