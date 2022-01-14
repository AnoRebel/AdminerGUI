const PHPServer = require("php_server_manager");


const server = new PHPServer({
    port: 9898,
    script: "index.php",
})
