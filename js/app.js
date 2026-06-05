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
      <input name="move${num}" id="move${num}"  class="inp-small">
      <button class="btn-search" onclick="search('move', ${num})">Search</button>
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

function toTitleCase(val) {
  return String(val)
    .toLowerCase() // Optional: ensures "ICY WIND" becomes "Icy Wind"
    .split(' ')    // Split the string into an array of words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
    .join(' ');    // Join them back with spaces
}

// ability search
async function search(id, prog) {
  // 1. Get the raw value from input
  const idprog = id + prog;
  const raw = document.getElementById(idprog).value;

  // 2. Format it to Title Case (e.g., "icy wind" -> "Icy Wind")
  const name = toTitleCase(raw);

  //const filelocation = '';

  switch (id) {
    case "move":
      filelocation = '../json/Moves/';
      break;
    case "ability":
      filelocation = '../json/Abilities/';
      break;
    case "nature":
      filelocation = '../json/Natures/';
      break;
  }

  const file = `${filelocation}${name}.json`;

  try {
    // 2. Fetch the file (Wait for the response)
    const response = await fetch(file);

    // Check if the file actually exists
    if (!response.ok) throw new Error(id + ' not found');

    // 3. Parse the JSON (Wait for the parsing to finish)
    const json = await response.json();

    // 4. Update the UI
    switch (id) {
      case "move":
        document.getElementById("div-" + idprog).classList.remove('hidden');
        document.getElementById(idprog + '_name').textContent = 'Name: ' + json.Name;
        document.getElementById(idprog + '_type').textContent = 'Type: ' + json.Type;
        document.getElementById(idprog + '_category').textContent = 'Category: ' + json.Category;
        document.getElementById(idprog + '_power').textContent = 'Power: ' + json.Power;
        if (json.Damage2 === '') {
          document.getElementById(idprog + '_damage1').textContent = 'Damage: ' + json.Damage1;
        } else {
          document.getElementById(idprog + '_damage2').textContent = 'Damage: ' + json.Damage1 + ' + ' + json.Damage2;
        }
        if (json.Accuracy2 === '') {
          document.getElementById(idprog + '_damage1').textContent = 'Accuracy: ' + json.Accuracy1;
        } else {
          document.getElementById(idprog + '_damage2').textContent = 'Accuracy: ' + json.Accuracy1 + ' + ' + json.Accuracy2;
        }
        document.getElementById(idprog + '_target').textContent = 'Target: ' + json.Target;
        document.getElementById(idprog + '_effect').textContent = 'Effect: ' + json.Effect;
        document.getElementById(idprog + '_description').textContent = 'Description: ' + json.Description;
        break;
      case "ability":
        document.getElementById("h4-abil-name").classList.remove('hidden');
        document.getElementById("h4-abil-name").textContent = json.Name;
        document.getElementById("p-abil-eff").classList.remove('hidden');
        document.getElementById("p-abil-eff").textContent = json.Effect;
        document.getElementById("p-abil-text").classList.remove('hidden');
        document.getElementById("p-abil-text").textContent = json.Description;
        break;
      case "nature":
        document.getElementById("h4-nat-name").classList.remove('hidden');
        document.getElementById("h4-nat-name").textContent = json.Name;
        document.getElementById("h4-nat-conf").classList.remove('hidden');
        document.getElementById("h4-nat-conf").textContent = 'Confidence: ' + json.Confidence;
        document.getElementById("h4-nat-conf").classList.remove('hidden');
        document.getElementById("h4-nat-conf").textContent = 'Confidence: ' + json.Confidence;
        document.getElementById("h4-nat-key").classList.remove('hidden');
        document.getElementById("h4-nat-key").textContent = json.Keywords;
        document.getElementById("p-nat-text").classList.remove('hidden');
        document.getElementById("p-nat-text").textContent = json.Description;
        break;
    }

  } catch (err) {
    console.error("Error loading move:", err);
    // Optional: clear the display if the move isn't found
    //document.getElementById("div-" + move_input).classList.add('hidden');
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
      fetch('../json/type_chart.json'),
      fetch('../json/ranks.json'),
      fetch('../json/poke_list.json')
    ]);

    // 2. Assign to variables
    TYPE_CHART = await typeRes.json();
    ranks = await rankRes.json();
    const allPokemon = await pokeRes.json();

    // 3. Initialize UI components
    initRanks();
    setupPokeUI(allPokemon);
    initData();

  } catch (err) {
    console.error("Initialization failed:", err);
  }
}

// Save
function saveSheetData(id) {
  // 1. Sync all text input values to their 'value' attribute
  document.querySelectorAll('input[type="text"], textarea').forEach(input => {
    if (input.tagName.toLowerCase() === 'textarea') {
      // Textareas use internal text, not a value attribute
      input.textContent = input.value;
    } else {
      // Standard inputs use the value attribute
      input.setAttribute('value', input.value);
    }
  });

  // 2. Sync all checkbox states to their 'checked' attribute
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    if (checkbox.checked) {
      checkbox.setAttribute('checked', 'checked');
    } else {
      checkbox.removeAttribute('checked');
    }
  });

  let nameHeader = '';
  // 3. Sync contenteditable fields (like the Name header)
  if (id === 'poke') {
    nameHeader = document.getElementById('name');
  }
  /*if (nameHeader) {
      nameHeader.setAttribute('data-current-text', nameHeader.innerText);
  }*/

  const nameTrainer = document.getElementById('trainer');
  /*if (nameTrainer) {
      nameTrainer.setAttribute('data-current-text', nameTrainer.innerText);
  }*/

  // 4. Get the entire HTML content
  const htmlContent = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;

  // 5. Create a "Blob" (the file data)
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);

  // 6. Create a hidden link and click it to trigger the download
  const link = document.createElement('a');
  link.href = url;
  if (id === 'poke') {
    link.download = nameTrainer.innerText + '_' + nameHeader.innerText + '.html';//`pokemon_sheet_${new Date().getTime()}.html`;
  } else {
    link.download = nameTrainer.innerText + '.html';
  }
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Variable to store the file handle so we can reuse it
let fileHandle = null;

async function savesamefile(id) {
  // 1. & 2. (Keep your existing code for syncing attributes)
  document.querySelectorAll('input[type="text"], textarea').forEach(input => {
    if (input.tagName.toLowerCase() === 'textarea') {
      // Textareas use internal text, not a value attribute
      input.textContent = input.value;
    } else {
      // Standard inputs use the value attribute
      input.setAttribute('value', input.value);
      console.log(input.tagName.toLowerCase());
    }
  });
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    if (checkbox.checked) {
      checkbox.setAttribute('checked', 'checked');
    } else {
      checkbox.removeAttribute('checked');
    }
  });

  // 3. Get the HTML content
  const htmlContent = "<!DOCTYPE html>\n" + document.documentElement.outerHTML;

  try {
    // Check if we already have a file handle. If not, ask the user to "Save As" once.
    if (!fileHandle) {
      const nameHeader = document.getElementById('name');
      const nameTrainer = document.getElementById('trainer');
      const suggestedName = id === 'poke'
        ? `${nameTrainer.innerText}_${nameHeader.innerText}.html`
        : `${nameTrainer.innerText}.html`;

      fileHandle = await window.showSaveFilePicker({
        suggestedName: suggestedName,
        types: [{
          description: 'HTML Document',
          accept: { 'text/html': ['.html'] },
        }],
      });
    }

    // 4. Create a writable stream to the file
    const writable = await fileHandle.createWritable();

    // 5. Write the content and close the stream
    await writable.write(htmlContent);
    await writable.close();

    alert("File saved successfully!");
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error(err);
      alert("Failed to save file.");
    }
  }
}

function initData() {
  // PASTE YOUR NPOINT ID HERE
  const BIN_ID = '37d9d0411000b72eda4b';
  const API_URL = `https://api.npoint.io/${BIN_ID}`;

  // Automatically load data from the cloud when page opens
  window.addEventListener('DOMContentLoaded', () => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) applyDataToSheet(data);
      })
      .catch(err => console.error("Error loading cloud data:", err));
  });
}

function saveSheetData2(sheetName) {
  // Send data to the cloud
  const sheetData = {
    inputs: {}, checkboxes: {}, textareas: {}
  };

  document.querySelectorAll('input[type="text"]').forEach(i => { if (i.id) sheetData.inputs[i.id] = i.value; });
  document.querySelectorAll('[contenteditable="true"]').forEach(e => { if (e.id) sheetData.inputs[e.id] = e.innerText; });
  document.querySelectorAll('input[type="checkbox"]').forEach(c => { if (c.name) sheetData.checkboxes[c.name] = c.checked; });
  document.querySelectorAll('textarea').forEach(t => { if (t.id) sheetData.textareas[t.id] = t.value; });

  const rankImg = document.getElementById('rank-img');
  if (rankImg) sheetData.inputs['rank-img-src'] = rankImg.src;

  // Send JSON directly to the cloud
  fetch(API_URL, {
    method: 'POST', // or PUT depending on the bin rule
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(sheetData)
  })
    .then(() => alert("Saved to Cloud! Accessible on all devices."))
    .catch(err => alert("Cloud save failed: " + err));
}

function applyDataToSheet(sheetData) {
  if (sheetData.inputs) {
    Object.keys(sheetData.inputs).forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (el.tagName === 'INPUT') el.value = sheetData.inputs[id];
        else if (el.hasAttribute('contenteditable')) el.innerText = sheetData.inputs[id];
      }
    });
    if (sheetData.inputs['rank-img-src']) document.getElementById('rank-img').src = sheetData.inputs['rank-img-src'];
  }
  if (sheetData.checkboxes) {
    Object.keys(sheetData.checkboxes).forEach(name => {
      const cb = document.querySelector(`input[name="${name}"]`);
      if (cb) cb.checked = sheetData.checkboxes[name];
    });
  }
  if (sheetData.textareas) {
    Object.keys(sheetData.textareas).forEach(id => {
      const ta = document.getElementById(id);
      if (ta) ta.value = sheetData.textareas[id];
    });
  }
}


// Function to Save to Browser Memory
function autoSave() {
  const data = {};
  // Save all text inputs
  document.querySelectorAll('input[type="text"], textarea').forEach(input => {
    data[input.id || input.name] = input.value;
  });
  // Save all checkboxes
  document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    data[checkbox.id || checkbox.name] = checkbox.checked;
  });

  localStorage.setItem('sheetData', JSON.stringify(data));
}

// Function to Load when the page opens
function loadData() {
  const saved = localStorage.getItem('sheetData');
  if (!saved) return;

  const data = JSON.parse(saved);
  Object.keys(data).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (el.type === 'checkbox') el.checked = data[id];
      else el.value = data[id];
    }
  });
}

// Run load on page startup
window.onload = loadData;

// Call autoSave() whenever an input changes
document.addEventListener('input', autoSave);

// Start the app
init();