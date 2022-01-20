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
    async run(cb) {
        await Neutralino.os.execCommand(
            `${this.php} ${this.getParameters().join(" ")}`
        );
    }
    async close() {
        if (!this.pid) return;
        console.info("Closing PHP Server: ", this.pid);
        Neutralino.debug.log(`Closing PHP Server: ${this.pid}`, "INFO");
        await Neutralino.os.execCommand(`kill -9 ${this.pid}`);
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
    directory: "./resources",
});
const onWindowClose = () => {
    Neutralino.app.exit();
    server.close().then((proc) => {
        if (proc.exitCode == 0) {
            this.pid = null;
            delete this.process;
            Neutralino.app.exit();
        } else {
            Neutralino.os.showNotification(
                "Error",
                `Failed to close. Code: ${proc.exitCode}. ${proc.stdErr}`,
                "ERROR"
            );
            console.error("Failed to close: ", proc.exitCode, proc.stdErr);
        }
    });
};

Neutralino.init();

if (
    document.readyState === "complete" ||
    (document.readyState !== "loading" && !document.ownerDocument.doScroll)
) {
    Neutralino.window.setDraggableRegion("neutralinoapp");

    // Neccessary Elements
    const ok_btn = document.querySelector("#ok_btn");
    const ok_text = document.querySelector("#ok_text");
    const status = document.querySelector("#status");
    const cancel = document.querySelector("#cancel");
    const loading = document.querySelector("#svg");

    // Initial Button Handlers
    cancel.onclick = onWindowClose;
    ok_btn.onclick = run_server;
} else {
    document.addEventListener("DOMContentLoaded", (e) => {
        Neutralino.window.setDraggableRegion("neutralinoapp");

        // Neccessary Elements
        const ok_btn = document.querySelector("#ok_btn");
        const ok_text = document.querySelector("#ok_text");
        const status = document.querySelector("#status");
        const cancel = document.querySelector("#cancel");
        const loading = document.querySelector("#svg");

        // Initial Button Handlers
        cancel.onclick = onWindowClose;
        ok_btn.onclick = run_server;
    });
}

const run_server = () => {
    status.innerText = "Starting Server...";
    ok_btn.disabled = true;
    ok_text.innerText = "Loading...";
    svg.classList.toggle("hidden");
    server.run().then((proc) => {
        server.process = proc;
        if (proc.exitCode == 0) {
            ok_btn.onclick = newWin;
            ok_text.innerText = "Open Adminer";
            ok_btn.disabled = false;
            svg.classList.toggle("hidden");
            status.innerText = `Server Started.\nOpen App.`;
            server.pid = proc.pid;
            console.info("PHP Server Started: ", server.getOp(proc));
            Neutralino.os.showNotification(
                "Adminer",
                `PHP Server Started: ${server.getOp(proc)}`,
                "INFO"
            );
            return true;
        }
        if (proc.exitCode == 1) {
            ok_text.innerText = "Start Server";
            ok_btn.disabled = false;
            svg.classList.toggle("hidden");
            status.innerText = `Failed to start server.\n ${server.getOp(
                proc
            )}`;
            console.error("General Error: ", server.getOp(proc));
            Neutralino.os.showNotification(
                "Error",
                `General Error: ${server.getOp(proc)}`,
                "ERROR"
            );
            return false;
        }
        if (proc.exitCode == 126) {
            ok_text.innerText = "Start Server";
            ok_btn.disabled = false;
            svg.classList.toggle("hidden");
            status.innerText = `Failed to start server.\n ${server.getOp(
                proc
            )}`;
            console.error(
                "Cannot Exec, maybe permission: ",
                server.getOp(proc)
            );
            Neutralino.os.showNotification(
                "Error",
                `Cannot Exec, maybe permission: ${server.getOp(proc)}`,
                "ERROR"
            );
            return false;
        }
        if (proc.exitCode == 127) {
            ok_text.innerText = "Start Server";
            ok_btn.disabled = false;
            svg.classList.toggle("hidden");
            status.innerText = `Failed to start server.\n ${server.getOp(
                proc
            )}`;
            console.error("Not Found: ", server.getOp(proc));
            Neutralino.os.showNotification(
                "Error",
                `Not Found: ${server.getOp(proc)}`,
                "ERROR"
            );
            return false;
        }
        if (proc.exitCode == 128) {
            ok_text.innerText = "Start Server";
            ok_btn.disabled = false;
            svg.classList.toggle("hidden");
            status.innerText = `Failed to start server.\n ${server.getOp(
                proc
            )}`;
            console.error("Invalid Argument: ", server.getOp(proc));
            Neutralino.os.showNotification(
                "Error",
                `Invalid Argument: ${server.getOp(proc)}`,
                "ERROR"
            );
            return false;
        }
    });
};

Neutralino.events.on("trayMenuItemClicked", onTrayMenuItemClicked);
Neutralino.events.on("windowClose", onWindowClose);

const newWin = async () => {
    let win = await Neutralino.window.create(
        "http://127.0.0.1:9898/adminer/",
        {
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
        }
    );
};

if (NL_OS != "Darwin") {
    // TODO: Fix https://github.com/neutralinojs/neutralinojs/issues/615
    setTray();
}
