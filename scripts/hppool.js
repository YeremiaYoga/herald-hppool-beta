let heraldHpPool_listActorCanvas = [];
let heraldHpPool_sceneUuid = "";
function herald_HpPoolChecker() {
  setInterval(async () => {
    const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");
    if (hasHpPool) {
      await herald_checkerShowHpPool();
    }
  }, 1000);
}

async function herald_checkerShowHpPool() {
  const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");
  if (!hasHpPool) return;
  if (hasHpPool.show == true) {
    herald_CreateHpPool();
  } else {
    const existingHpPoolBar = document.getElementById("heraldHpPool");
    if (existingHpPoolBar) {
      existingHpPoolBar.remove();
    }
  }
}

function getListActor() {
  if (!canvas || !canvas.scene) {
    console.log("No active scene found.");
    return;
  }
  heraldHpPool_listActorCanvas = [];
  const tokens = canvas.tokens.placeables;
  for (let token of tokens) {
    if (token.actor.type == "npc") {
      heraldHpPool_listActorCanvas.push(token.actor);
    }
  }
  heraldHpPool_sceneUuid = canvas.scene.uuid;
}

function herald_toggleHpPool() {
  if (!game.user.isGM) return;
  const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");
  if (hasHpPool) {
    if (hasHpPool.show == false) {
      herald_onHpPool();
    } else {
      herald_offHpPool();
    }
  } else {
    console.log("belum disetup");
  }
}

async function herald_onHpPool() {
  const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");
  if (hasHpPool) {
    const existingHpPoolBar = document.getElementById("heraldHpPool");
    if (existingHpPoolBar) {
      existingHpPoolBar.remove();
    }

    await canvas.scene.setFlag("world", "hasHpPool", {
      show: true,
      checker: true,
    });
    herald_CreateHpPool();
  }
  console.log(hasHpPool);
}

async function herald_offHpPool() {
  const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");
  const existingHpPoolBar = document.getElementById("heraldHpPool");
  if (existingHpPoolBar) {
    existingHpPoolBar.remove();
  }
  await canvas.scene.setFlag("world", "hasHpPool", {
    show: false,
    checker: false,
  });
  hpPoolResetActor();
}

async function showDialogHpPool() {
  getListActor();

  const templatePath =
    "modules/herald-hppool-beta/templates/herald-dialogHpPool.html";
  const response = await fetch(templatePath);
  let templateContent = await response.text();
  let dialogTitle = `HP Pool ${heraldHpPool_sceneUuid}`;
  const dialogHpPool = new Dialog({
    title: dialogTitle,
    content: templateContent,
    default: "close",
    buttons: {},
    render: async (html) => {
      const button = $(
        '<button id="heraldHpPool-button-showconfirm"class="heraldHpPool-button-showconfirm">Create HP Pool</button>'
      );
      html.find(".heraldHpPool-button-container").append(button);
      button.on("click", () => {
        showDialogConfirmHpPool();
      });
    },
  });
  dialogHpPool.render(true);
  Hooks.once("renderDialog", (app) => {
    if (app instanceof Dialog && app.title === dialogTitle) {
      const width = 600;
      const height = 500;

      app.setPosition({
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2,
        width: width,
        height: height,
        scale: 1.0,
      });
    }

    renderListActor();
  });
}

function renderListActor() {
  const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");
  let listActorDiv = document.getElementById("heraldHpPool-listActor");

  let listDataActor = "";
  for (let actor of heraldHpPool_listActorCanvas) {
    let arrUuid = actor.uuid.split(".");
    let uuidToken = arrUuid[2] + "." + arrUuid[3];
    let uuidActor = arrUuid[4] + "." + arrUuid[5];
    let input = `  <input
          id="${actor.uuid}"
          type="checkbox"
          class="heraldHpPool-actor-checkbox"
          value="${actor.uuid}"
        />`;
    for (let data of hasHpPool.arrActorUuid) {
      if (actor.uuid == data) {
        input = `  <input
          id="${actor.uuid}"
          type="checkbox"
          class="heraldHpPool-actor-checkbox"
          value="${actor.uuid}"
          checked
        />`;
      }
    }
    listDataActor += `
      <div class="heraldHpPool-actor-container">
        <div class="heraldHpPool-imgandname">
          <img src="${actor.img}" alt="Image" class="heraldHpPool-actor-image" />
            <div>
              <span class="heraldHpPool-actor-name">${actor.name}</span>
            
              <p class="heraldHpPool-actor-uuid">${uuidToken}</p>
               <p class="heraldHpPool-actor-uuid">${uuidActor}</p>
            </div>
        </div>
        ${input}
      
      </div>
   `;
  }

  if (listActorDiv) {
    listActorDiv.innerHTML = listDataActor;
  }
}

async function showDialogConfirmHpPool() {
  const templatePath =
    "modules/herald-hppool-beta/templates/herald-dialogConfirmHpPool.html";
  const response = await fetch(templatePath);
  let templateContent = await response.text();

  const dialogConfirmHpPool = new Dialog({
    title: "Confirm Create HP Pool",
    content: templateContent,
    default: "close",
    buttons: {},
    render: async (html) => {
      const input = $(`
        <label for="heraldHpPool-name">Hp Pool Name :</label>
        <input type="text" id="heraldHpPool-name" name="heraldHpPool-name">`);
      const button = $(
        '<button id="heraldHpPool-button-createpool"class="heraldHpPool-button-createpoll">Create</button>'
      );
      html.find(".heraldHpPool-formdata").append(input);
      html.find(".heraldHpPool-button-confirmcontainer").append(button);
      button.on("click", () => {
        setupHpPool();
      });
    },
  });
  dialogConfirmHpPool.render(true);
  Hooks.once("renderDialog", (app) => {
    if (app instanceof Dialog && app.title === "Confirm Create HP Pool") {
      const width = 500;
      const height = 500;

      app.setPosition({
        left: (window.innerWidth - width) / 2,
        top: (window.innerHeight - height) / 2,
        width: width,
        height: height,
        scale: 1.0,
      });
    }
  });
}

async function setupHpPool() {
  await canvas.scene.unsetFlag("world", "hasHpPool");
  let arrActorUuid = [];
  let totalMaxHpPool = 0;
  let totalActorHpPool = 0;
  let listChecked = document.querySelectorAll(".heraldHpPool-actor-checkbox");
  for (let checkbox of listChecked) {
    if (checkbox.checked) {
      arrActorUuid.push(checkbox.value);
    }
  }

  let heraldHpPool_Name = "";

  heraldHpPool_Name = document.getElementById("heraldHpPool-name").value;
  if (!heraldHpPool_Name) {
    console.log("herald hp pool masih kosong");
    return;
  }

  for (let data of arrActorUuid) {
    const actor = await fromUuid(data);
    totalActorHpPool += actor.system.attributes.hp.value;
    totalMaxHpPool += actor.system.attributes.hp.max;
  }

  await canvas.scene.setFlag("world", "hasHpPool", {
    show: true,
    arrActorUuid: arrActorUuid,
    heraldHpPoolName: heraldHpPool_Name,
    totalActorHpPool: totalActorHpPool,
    totalMaxHpPool: totalMaxHpPool,
  });
  hpPoolResetActor();
  herald_CreateHpPool();
  setTimeout(async () => {
    await canvas.scene.setFlag("world", "hasHpPool", {
      checker: true,
    });
  }, 3000);
}

async function herald_CreateHpPool() {
  const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");

  if (hasHpPool) {
    const existingHpPoolBar = document.getElementById("heraldHpPool");
    if (existingHpPoolBar) {
      existingHpPoolBar.remove();
    }
  }

  const hp = hasHpPool.totalActorHpPool;
  const maxHp = hasHpPool.totalMaxHpPool;
  const hpPercent = (hp / maxHp) * 100;
  setHpmaxActorSelected();
  fetch("/modules/herald-hppool-beta/templates/herald-hpPool.html")
    .then((response) => response.text())
    .then((html) => {
      const div = document.createElement("div");
      div.innerHTML = html;

      const hpBar = div.querySelector("#heraldHpPool-hpbar");
      const bghpBar = div.querySelector("#heraldHpPool-bghpbar");
      const tokenName = div.querySelector("#heraldHpPool-tokenname");

      tokenName.textContent = hasHpPool.heraldHpPoolName;
      hpBar.style.width = `${hpPercent}%`;
      bghpBar.style.width = `${hpPercent}%`;
      div.firstChild.id = "heraldHpPool";

      document.body.appendChild(div.firstChild);
    })
    .catch((err) => {
      console.error("Gagal memuat template hpbar.html:", err);
    });
}

async function setHpmaxActorSelected() {
  const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");
  let listActorSelected = [];

  for (let data of hasHpPool.arrActorUuid) {
    const actor = await fromUuid(data);
    listActorSelected.push(actor);
  }

  for (let actor of listActorSelected) {
    let addTempHpMax =
      hasHpPool.totalMaxHpPool - actor.system.attributes.hp.max;
    await actor.update({
      "system.attributes.hp.tempmax": addTempHpMax,
      "system.attributes.hp.value": hasHpPool.totalActorHpPool,
    });
  }
}

async function hpPoolResetActor() {
  const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");
  let listActorSelected = [];

  let spreadDamage = Math.ceil(
    (hasHpPool.totalMaxHpPool - hasHpPool.totalActorHpPool) /
      hasHpPool.arrActorUuid.length
  );
  let hpActorValue = hasHpPool.totalActorHpPool - spreadDamage;
  for (let data of hasHpPool.arrActorUuid) {
    const actor = await fromUuid(data);
    listActorSelected.push(actor);
  }
  for (let actor of listActorSelected) {
    await actor.update({
      "system.attributes.hp.tempmax": 0,
      "system.attributes.hp.value": hpActorValue,
    });
  }
}

async function herald_checkDamageHpPool() {
  const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");
  const existingHpPoolBar = document.getElementById("heraldHpPool");
  if (!existingHpPoolBar) {
    return;
  }
  if (hasHpPool.show == false) {
    return;
  }
  let listActorSelected = [];
  for (let data of hasHpPool.arrActorUuid) {
    const actor = await fromUuid(data);
    listActorSelected.push(actor);
  }
  let totalDamagedActor = 0;
  let totalHealActor = 0;
  let listDamagedActor = [];
  let detectAction = "damage";

  for (let actor of listActorSelected) {
    if (actor.system.attributes.hp.value == hasHpPool.totalActorHpPool) {
      listDamagedActor.push(actor);
    }
    if (actor.system.attributes.hp.value < hasHpPool.totalActorHpPool) {
      totalDamagedActor +=
        hasHpPool.totalActorHpPool - actor.system.attributes.hp.value;
    }
    if (actor.system.attributes.hp.value > hasHpPool.totalActorHpPool) {
      totalHealActor = actor.system.attributes.hp.value;
    }
  }

  let finalActorHp = hasHpPool.totalActorHpPool - totalDamagedActor;

  await canvas.scene.setFlag("world", "hasHpPool", {
    totalActorHpPool: finalActorHp,
  });

  for (let actor of listDamagedActor) {
    await actor.update({
      "system.attributes.hp.value": finalActorHp,
    });
  }

  console.log(listDamagedActor);
  console.log(totalDamagedActor);
}

Hooks.on("updateActor", async (actor, data) => {
  const hasHpPool = canvas.scene.getFlag("world", "hasHpPool");
  console.log(hasHpPool);
  if (hasHpPool) {
    if (hasHpPool.checker == true) {
      herald_checkDamageHpPool();
    }
  }
});

export { showDialogHpPool, herald_HpPoolChecker, herald_toggleHpPool };
