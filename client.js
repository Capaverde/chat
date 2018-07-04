readline = require("readline")

interface = readline.createInterface({ input : process.stdin, output : process.stdout });


interface.on("line", function (line) {
	console.log(line);
	if (line.split(" ")[0] == "/nick"){

	} else if (line.split(" ")[0] == "/connect"){

	} else if (line.split(" ")[0] == "/join"){

	} else {
		
	}
});
