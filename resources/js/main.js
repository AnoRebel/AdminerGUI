// This is just a sample app. You can structure your Neutralinojs app code as you wish.
// This example app is written with vanilla JavaScript and HTML.
// Feel free to use any frontend framework you like :)

class LocalServer {
    constructor(config) {
        this.php = "php";
        this.host = "127.0.0.1";
        this.port = 8000;
        this.directory = null;
        this.script = null;
        this.directives = {};
        this.config = null;
        this.stdio = "inherit";
        this.env = Neutralino.os.getEnv;

        if (config) {
            Object.keys(config).forEach(name => {
                if (!(name in this)) {
                    throw new Error(`Config ${name} is not valid`);
                }
                if (name === "env") {
                    this[name] = Object.assign({}, this[name], config[name]);
                } else {
                    this[name] = config[name];
                }
            });
        }
    }
    getParameters() {
        const params = ["-S", `${this.host}:${this.port}`];
        if (this.directory) {
            params.push("-t");
            params.push(this.directory);
        }
        Object.keys(this.directives).forEach(d => {
            params.push("-d");
            params.push(`${d}=${this.directives[d]}`);
        });
        if (this.config) {
            params.push("-c");
            params.push(this.config);
        }
        if (this.script) {
            params.push(this.script);
        }
        return params;
    }
    run(cb) {
        this.process = Neutralino.os.execCommand(`${this.php} ${this.getParameters().join(" ")}`);
        if (this.process.exitCode > 0) {
            console.log("PHP Server Closed");
            console.error("PHP Server Error: ", this.process.stdErr);
        }
        if (this.process.exitCode == 1) {
            console.log("General Error");
        }
        if (this.process.exitCode == 126) {
            console.log("Cannot Exec, maybe permission");
        }
        if (this.process.exitCode == 127) {
            console.log("Not Found");
        }
        if  (this.process.exitCode == 128) {
            console.log("Invalid Argument");
        }
    }
    close() {
        if (!this.process) return;
        this.process.kill();
        delete this.process;
    }
    toString() {
        return `${this.php} ${this.getParameters().join(" ")}`;
    }
}
function showInfo() {
    document.getElementById("info").innerHTML = `
        ${NL_APPID} is running on port ${NL_PORT}  inside ${NL_OS}
        <br/><br/>
        <span>server: v${NL_VERSION} . client: v${NL_CVERSION}</span>
        `;
}

function openDocs() {
    Neutralino.os.open("https://neutralino.js.org/docs");
}

function openTutorial() {
    Neutralino.os.open(
        "https://www.youtube.com/watch?v=txDlNNsgSh8&list=PLvTbqpiPhQRb2xNQlwMs0uVV0IN8N-pKj"
    );
}

function setTray() {
    if (NL_MODE != "window") {
        console.log("INFO: Tray menu is only available in the window mode.");
        return;
    }
    let tray = {
        icon: "/resources/icons/trayIcon.png",
        menuItems: [
            { id: "VERSION", text: "Get version" },
            { id: "SEP", text: "-" },
            { id: "QUIT", text: "Quit" },
        ],
    };
    Neutralino.os.setTray(tray);
}

function onTrayMenuItemClicked(event) {
    switch (event.detail.id) {
        case "VERSION":
            Neutralino.os.showMessageBox(
                "Version information",
                `Neutralinojs server: v${NL_VERSION} | Neutralinojs client: v${NL_CVERSION}`
            );
            break;
        case "QUIT":
            Neutralino.app.exit();
            break;
    }
}

function onWindowClose() {
    Neutralino.app.exit();
}

Neutralino.init();

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
// This request will be queued and processed when the extension connects.
Neutralino.extensions
    .dispatch(
        "js.neutralino.adminer",
        "eventToExtension",
        "Hello extension!"
    )
    .catch((err) => {
        console.log("Extension isn't loaded!");
    });
Neutralino.events.on("eventFromExtension", (evt) => {
    console.log(`INFO: Test extension said: ${evt.detail}`);
});

Neutralino.events.on("windowClose", onWindowClose);

if (NL_OS != "Darwin") {
    // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
    setTray();
}

showInfo();
