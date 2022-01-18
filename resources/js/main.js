// This is just a sample app. You can structure your Neutralinojs app code as you wish.
// This example app is written with vanilla JavaScript and HTML.
// Feel free to use any frontend framework you like :)
class PHPServer {
    constructor(config) {
        this.php = "php";
        this.host = "127.0.0.1";
        this.port = 8000;
        this.directory = null;
        this.script = null;
        this.directives = {};
        this.config = null;
        this.pid = null;

        if (config) {
            Object.keys(config).forEach((name) => {
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
        Object.keys(this.directives).forEach((d) => {
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
        Neutralino.os
            .execCommand(`${this.php} ${this.getParameters().join(" ")}`)
            .then((proc) => {
                this.process = proc;
                if (proc.exitCode == 0) {
                    this.pid = proc.pid;
                    console.info("PHP Server Started: ", this.getOp(proc));
                    Neutralino.debug.log(
                        `PHP Server Started: ${this.getOp(proc)}`,
                        "INFO"
                    );
                }
                if (proc.exitCode == 1) {
                    console.error("General Error: ", this.getOp(proc));
                    Neutralino.debug.log(
                        `General Error: ${this.getOp(proc)}`,
                        "ERROR"
                    );
                }
                if (proc.exitCode == 126) {
                    console.error(
                        "Cannot Exec, maybe permission: ",
                        this.getOp(proc)
                    );
                    Neutralino.debug.log(
                        `Cannot Exec, maybe permission: ${this.getOp(proc)}`,
                        "ERROR"
                    );
                }
                if (proc.exitCode == 127) {
                    console.error("Not Found: ", this.getOp(proc));
                    Neutralino.debug.log(
                        `Not Found: ${this.getOp(proc)}`,
                        "ERROR"
                    );
                }
                if (proc.exitCode == 128) {
                    console.error("Invalid Argument: ", this.getOp(proc));
                    Neutralino.debug.log(
                        `Invalid Argument: ${this.getOp(proc)}`,
                        "ERROR"
                    );
                }
            });
    }
    close() {
        if (!this.pid) return;
        console.info("Closing PHP Server: ", this.pid);
        Neutralino.debug.log(`Closing PHP Server: ${this.pid}`, "INFO");
        Neutralino.os.execCommand(`kill -9 ${this.pid}`).then((proc) => {
            if (proc.exitCode == 0) {
                this.pid = null;
                delete this.process;
            } else {
                Neutralino.debug.log(
                    `Failed to close. Code: ${proc.exitCode}. ${proc.stdErr}`,
                    "ERROR"
                );
                console.error("Failed to close: ", proc.exitCode, proc.stdErr);
            }
        });
    }
    toString() {
        return `${this.php} ${this.getParameters().join(" ")}`;
    }
    getOp(io) {
        if (io.stdOut == "" && io.stdErr == "") {
            return "Not Output";
        } else if (io.stdOut == "") {
            return io.stdErr;
        } else {
            return io.stdOut;
        }
    }
}

const showInfo = () =>
    (document.getElementById("info").innerHTML = `
        ${NL_APPID} is running on port ${NL_PORT}  inside ${NL_OS}
        <br/><br/>
        <span>server: v${NL_VERSION} . client: v${NL_CVERSION}</span>
        `);

const openDocs = () => Neutralino.os.open("https://neutralino.js.org/docs");

const openTutorial = () =>
    Neutralino.os.open(
        "https://www.youtube.com/watch?v=txDlNNsgSh8&list=PLvTbqpiPhQRb2xNQlwMs0uVV0IN8N-pKj"
    );

const setTray = () => {
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
};

const onTrayMenuItemClicked = (event) => {
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
};

const server = new PHPServer({
    port: "9898",
    directory: "./resources/adminer",
});
const onWindowClose = () => {
    server.close();
    Neutralino.app.exit();
};

server.run();
Neutralino.init();

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);

const newWin = async () => {
    let win = await Neutralino.window.create("http://127.0.0.1:9898", {
        title: "Adminer",
        width: 800,
        height: 600,
        minWidth: 400,
        minHeight: 300,
        fullScreen: false,
        alwaysOnTop: false,
        icon: "/resources/icons/appIcon.png",
        enableInspector: true,
        borderless: false,
        maximize: false,
        hidden: false,
        resizable: true,
        exitProcessOnClose: false,
    });
};
window.newWin = newWin;

if (NL_OS != "Darwin") {
    // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
    setTray();
}

showInfo();
