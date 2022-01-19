Neutralino.init();
console.log("Loaded!");
Neutralino.events.on('ready', () => {
    Neutralino.os.showMessageBox('Welcome', 'Hello Neutralinojs');
});
