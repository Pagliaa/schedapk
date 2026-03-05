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

async function loadPoke() {
  const response = await fetch('json/poke_list.json'); // Carica il file JSON
  const links = await response.json();
  const listContainer = document.getElementById('pokeList');
  var popup = document.getElementById("popupPokeList");
  var type2sp = document.getElementById("type2");

  links.forEach(item => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    const name = document.getElementById('pokename');
    const nr = document.getElementById('pokenr');
    const type1 = document.getElementById('type1');
    const type2 = document.getElementById('type2');
    const fixcla = 'spa-type';
    var ty1cla = document.getElementById('type1').className;
    var ty2cla = document.getElementById('type2').className;

    a.textContent = item.pokemon;
    a.href = '#';

    a.addEventListener('click', (e) => {
      e.preventDefault(); // Stop the link from jumping
      name.innerHTML = item.pokemon; //nome
      nr.innerHTML = '# ' + String(item.nr).padStart(3, '0'); //nr dex
      type1.innerHTML = '???';

      //class color
      type1.classList.remove(fixcla);
      ty1cla = document.getElementById('type1').className;
      type1.classList.remove(ty1cla);
      type1.classList.add(fixcla);
      ty1cla = 'type-' + item.tipo1;
      type1.classList.add(ty1cla);

      type1.innerHTML = item.tipo1; //tipo1 testo

      if (item.tipo2 === "") {
        type2.innerHTML = '';
        type2sp.classList.add('hidden');
      } else {
        type2.innerHTML = item.tipo2; //tipo2 testo
        type2sp.classList.remove('hidden');

        //class color
        type2.classList.remove(fixcla);
        ty2cla = document.getElementById('type2').className;
        type2.classList.remove(ty2cla);
        type2.classList.add(fixcla);
        ty2cla = 'type-' + item.tipo2;
        type2.classList.add(ty2cla);
      }
      popup.classList.toggle('hidden');
    });

    li.appendChild(a);
    listContainer.appendChild(li);
  });
}

loadPoke();