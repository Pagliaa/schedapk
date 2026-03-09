const TYPE_CHART = {
  typeless: {debolezza: [], resistenza: [], immunita: [] },
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
  psico: { debolezza: ['coleottero', 'fantasmi', 'buio'], resistenza: ['lotta', 'psico'], immunita: [] },
  coleottero: { debolezza: ['fuoco', 'volante', 'roccia'], resistenza: ['erba', 'lotta', 'terra'], immunita: [] },
  roccia: { debolezza: ['acqua', 'erba', 'lotta', 'terra', 'acciaio'], resistenza: ['normale', 'fuoco', 'veleno', 'volante'], immunita: [] },
  spettro: { debolezza: ['spettro', 'buio'], resistenza: ['veleno', 'coleottero'], immunita: ['normale', 'lotta'] },
  drago: { debolezza: ['ghiaccio', 'drago', 'folletto'], resistenza: ['fuoco', 'acqua', 'erba', 'elettro'], immunita: [] },
  buio: { debolezza: ['lotta', 'coleottero', 'folletto'], resistenza: ['spettro', 'buio'], immunita: ['psico'] },
  acciaio: { debolezza: ['fuoco', 'lotta', 'terra'], resistenza: ['normale', 'erba', 'ghiaccio', 'volante', 'psico', 'coleottero', 'roccia', 'drago', 'acciaio', 'folletto'], immunita: ['veleno'] },
  folletto: { debolezza: ['veleno', 'acciaio'], resistenza: ['lotta', 'coleottero', 'buio'], immunita: ['drago'] }
};

function dexpre(el) {
  if (el.value.length > 1 && !el.value.startsWith('# ')) {
    el.value = '# ' + el.value;
  }
}

function poke_list() {
  var popup = document.getElementById("popupPokeList");
  popup.classList.toggle('hidden');
}

function maskingString(str, start, end) {
  if (!str || start < 0 || start >= str.length || end < 0 || end > str.length || start >= end) {
    return str;
  }
  const maskLength = end - start;
  const maskedStr = str.substring(0, start) + "*".repeat(maskLength) + str.substring(end);
  return maskedStr;
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

  console.log(t1);

  // Reset current lists
  [listRes, listDeb, listImm].forEach(el => el.innerHTML = '');

  const multipliers = {};
  Object.keys(TYPE_CHART).forEach(type => multipliers[type] = 1.0);

  // Apply modifiers for each type the Pokemon has
  [t1, t2].forEach(t => {
    if (!t || !TYPE_CHART[t]) return;
    TYPE_CHART[t].debolezza.forEach(type => multipliers[type] *= 2);
    TYPE_CHART[t].resistenza.forEach(type => multipliers[type] *= 0.5);
    TYPE_CHART[t].immunita.forEach(type => multipliers[type] *= 0);
  });

  // Populate the UI
  for (const [type, value] of Object.entries(multipliers)) {
    const li = document.createElement('li');
    const typeName = type.charAt(0).toUpperCase() + type.slice(1);

    if (value > 1) {
      li.textContent = `${typeName} (x${value})`;
      listDeb.appendChild(li);
    } else if (value > 0 && value < 1) {
      li.textContent = `${typeName} (x${value})`;
      listRes.appendChild(li);
    } else if (value === 0) {
      li.textContent = typeName;
      listImm.appendChild(li);
    }
  }
}

async function loadPoke() {
  const response = await fetch('json/poke_list.json');
  const allPokemon = await response.json();

  const listContainer = document.getElementById('pokeList');
  const searchInput = document.getElementById('pokeSearch'); // Add this ID to your <input>
  const popup = document.getElementById("popupPokeList");

  // Get UI elements once (Optimization)
  const nameDisplay = document.getElementById('pokename');
  const nrDisplay = document.getElementById('pokenr');
  const type1Display = document.getElementById('type1');
  const type2Display = document.getElementById('type2');
  const fixcla = 'spa-type';

  // Function to build the list
  const renderList = (pokemonArray) => {
    listContainer.innerHTML = ''; // Clear current list

    pokemonArray.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = item.pokemon;
      a.href = '#';

      a.addEventListener('click', (e) => {
        e.preventDefault();

        // Update Text
        nameDisplay.innerHTML = item.pokemon;
        nrDisplay.innerHTML = '# ' + String(item.nr).padStart(3, '0');

        // Update Type 1 Class & Text
        type1Display.className = fixcla; // Reset classes
        type1Display.classList.add('type-' + item.tipo1);
        type1Display.innerHTML = item.tipo1;

        // Update Type 2
        if (item.tipo2 === "" || !item.tipo2) {
          type2Display.innerHTML = '';
          type2Display.classList.add('hidden');
        } else {
          type2Display.className = fixcla; // Reset classes
          type2Display.classList.remove('hidden');
          type2Display.classList.add('type-' + item.tipo2);
          type2Display.innerHTML = item.tipo2;
        }

        popup.classList.add('hidden'); // Close popup after selection

        const type1 = item.tipo1.toLowerCase();
        const type2 = item.tipo2 ? item.tipo2.toLowerCase() : null;

        typeEff(type1, type2);
      });

      li.appendChild(a);
      listContainer.appendChild(li);
    });
  };

  // Initial Render
  renderList(allPokemon);

  // Search Listener
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allPokemon.filter(p =>
      p.pokemon.toLowerCase().includes(query)
    );
    renderList(filtered);
  });

}

loadPoke();