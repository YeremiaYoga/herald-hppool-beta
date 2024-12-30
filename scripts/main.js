import * as hppool from "./hppool.js";

Hooks.on("ready", () => {
  hppool.herald_HpPoolChecker();
});

Hooks.on("getSceneControlButtons", (controls) => {
  if (!game.user.isGM) return;
  const tokenControls = controls.find((control) => control.name === "token");
  if (tokenControls) {
    tokenControls.tools.push({
      name: "herald-hppool-setup",
      title: "Herald HP Pool Setup",
      icon: "fas fa-info",
      visible: true,
      onClick: () => {
        hppool.showDialogHpPool();
      },
      button: true,
    });

    tokenControls.tools.push({
      name: "herald-hppool-show",
      title: "Herald HP Pool Show",
      icon: "fas fa-exclamation",
      visible: true,
      onClick: () => {
        hppool.herald_toggleHpPool();
      },
      button: true,
    });
  }
});
