let TYPE_CHART = {};
let ranks = [];

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

function toggleTypeEff(id) {
  const div = document.getElementById(id);
  const btn = event.currentTarget; // Prende il bottone che ha scatenato l'evento

  div.classList.toggle('hidden');

  if (div.classList.contains('hidden')) {
    btn.textContent = 'Show';
  } else {
    btn.textContent = 'Hide';
  }
}

function initRanks() {
  const listContainer = document.getElementById('popupRank');

  // Generate the list items
  const listHtml = ranks.map(rank => `
        <li onclick="selectRank('${rank.image}')">
            <img src="${rank.image}" alt="${rank.label}" class="img-rank">
        </li>
    `).join('');

  listContainer.innerHTML = listHtml;
}

// Function to handle clicking the main button
function rank_change() {
  const popup = document.getElementById('popupRank');
  popup.classList.toggle('hidden');
  const img = document.getElementById('rank-btn');
  img.classList.toggle('hidden');
}

// Function to change the main image when a rank is selected
function selectRank(imgSrc) {
  document.getElementById('rank-img').src = imgSrc;
  document.getElementById('popupRank').classList.add('hidden');
  document.getElementById('rank-btn').classList.remove('hidden');
}

/*function rank_change() {
  var popup = document.getElementById("popupRank");
  popup.classList.toggle('hidden');
}*/

// Function to add moves
function addMove(prefix) {
  // 1. Find the input with a name starting with the prefix to locate the correct container
  const currentCount = document.querySelectorAll(`input[name^="${prefix}"]`).length;

  num = currentCount + 1;

  const container = document.getElementById('div-moves'); // The parent element where you want to add this

  const moveBoxHTML = `
    <div class="margin10"></div>

    <div class="div-single-move" id="box_move${num}">
    <!--Move ${num}-->
      <input name="move${num}" id="move${num}">
      <button onclick="moveSearch('move${num}')">Search</button>
      <div id="div-move${num}" class="hidden">
      <div class="margin10"></div>
        <h4 id="move${num}_name"></h4>
        <h4 id="move${num}_type"></h4>
        <h4 id="move${num}_category"></h4>
        <h4 id="move${num}_power"></h4>
        <h4 id="move${num}_damage1"></h4>
        <h4 id="move${num}_damage2"></h4>
        <h4 id="move${num}_accuracy1"></h4>
        <h4 id="move${num}_accuracy2"></h4>
        <h4 id="move${num}_target"></h4>
        <h4 id="move${num}_effect"></h4>
        <h4 id="move${num}_description"></h4>
      </div>
    </div>
    `;

  // Add it to the page
  container.insertAdjacentHTML('beforeend', moveBoxHTML);

}

// Function to remove moves
function removeMove() {
  const container = document.getElementById('div-moves');
  const moves = container.querySelectorAll('.div-single-move');

  if (moves.length > 1) {
    // Remove the last element in the list
    moves[moves.length - 1].remove();

    // Also remove the margin div if you added one
    const margins = container.querySelectorAll('.margin10');
    if (margins.length > 0) {
      margins[margins.length - 1].remove();
    }
  } else {
    console.log("No moves left to remove!");
  }
}

// move search
async function moveSearch(move_input) {
  // 1. Get the value and format the filename
  const move = document.getElementById(move_input).value;
  const filelocation = 'json/Moves/';
  const movefile = `${filelocation}${move}.json`;

  try {
    // 2. Fetch the file (Wait for the response)
    const response = await fetch(movefile);

    // Check if the file actually exists
    if (!response.ok) throw new Error('Move not found');

    // 3. Parse the JSON (Wait for the parsing to finish)
    const movejson = await response.json();

    // 4. Update the UI
    document.getElementById("div-" + move_input).classList.remove('hidden');
    document.getElementById(move_input + '_name').textContent = 'Name: ' + movejson.Name;
    document.getElementById(move_input + '_type').textContent = 'Type: ' + movejson.Type;
    document.getElementById(move_input + '_category').textContent = 'Category: ' + movejson.Category;
    document.getElementById(move_input + '_power').textContent = 'Power: ' + movejson.Power;
    if (movejson.Damage2 === '') {
      document.getElementById(move_input + '_damage1').textContent = 'Damage: ' + movejson.Damage1;
    } else {
      document.getElementById(move_input + '_damage2').textContent = 'Damage: ' + movejson.Damage1 + ' + ' + movejson.Damage2;
    }
    if (movejson.Accuracy2 === '') {
      document.getElementById(move_input + '_damage1').textContent = 'Accuracy: ' + movejson.Accuracy1;
    } else {
      document.getElementById(move_input + '_damage2').textContent = 'Accuracy: ' + movejson.Accuracy1 + ' + ' + movejson.Accuracy2;
    }
    document.getElementById(move_input + '_target').textContent = 'Target: ' + movejson.Target;
    document.getElementById(move_input + '_effect').textContent = 'Effect: ' + movejson.Effect;
    document.getElementById(move_input + '_description').textContent = 'Description: ' + movejson.Description;
  } catch (err) {
    console.error("Error loading move:", err);
    // Optional: clear the display if the move isn't found
    document.getElementById("div-" + move_input).classList.add('hidden');
  }
}

// Pokemon List
function setupPokeUI(allPokemon) {
  const listContainer = document.getElementById('pokeList');
  const searchInput = document.getElementById('pokeSearch');
  const popup = document.getElementById("popupPokeList");

  // DOM elements for display
  const nameDisplay = document.getElementById('pokename');
  const nrDisplay = document.getElementById('pokenr');
  const type1Display = document.getElementById('type1');
  const type1Text = document.getElementById('type1-text');
  const type2Display = document.getElementById('type2');
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

        // Trigger Automation - Now uses the global TYPE_CHART loaded in init()
        typeEff(item.tipo1, item.tipo2);
        popup.classList.add('hidden');
      });

      li.appendChild(a);
      listContainer.appendChild(li);
    });
  };

  // Initial render
  renderList(allPokemon);

  // Search listener
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allPokemon.filter(p => p.pokemon.toLowerCase().includes(query));
    renderList(filtered);
  });
}

// --- Main Logic ---

// Global variables to store the data
async function init() {
  try {
    // 1. Fetch all data concurrently
    const [typeRes, rankRes, pokeRes] = await Promise.all([
      fetch('json/type_chart.json'),
      fetch('json/ranks.json'),
      fetch('json/poke_list.json')
    ]);

    // 2. Assign to variables
    TYPE_CHART = await typeRes.json();
    ranks = await rankRes.json();
    const allPokemon = await pokeRes.json();

    // 3. Initialize UI components
    initRanks();
    setupPokeUI(allPokemon);

  } catch (err) {
    console.error("Initialization failed:", err);
  }
}

// Start the app
init();