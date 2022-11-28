let Imap = require("imap");
let inspect = require("util").inspect;
const { env } = require("process");
require("dotenv").config();

let imap = new Imap({
	user: "kingstongise@gmail.com",
	password: env.gmailpass,
	host: "imap.gmail.com",
	port: 993,
	tls: true,
	tlsOptions: { rejectUnauthorized: false }
});

function openInbox(cb) {
	imap.openBox("INBOX", true, cb);
}

imap.once("ready", function () {
	openInbox(function (err, box) {
		if (err) throw err;
		var f = imap.seq.fetch(box.messages.total + ":*", { bodies: ["HEADER.FIELDS (FROM)",""] });
		f.on("message", function (msg, seqno) {
			console.log("Message #%d", seqno);
			var prefix = "(#" + seqno + ") ";
			msg.on("body", function (stream, info) {
				if (info.which === "")
					console.log(prefix + "Body [%s] found, %d total bytes", inspect(info.which), info.size);
				var buffer = "", count = 0;
				stream.on("data", function (chunk) {
					count += chunk.length;
					buffer += chunk.toString("utf8");

					console.log(buffer);

					let enc = buffer.substring(buffer.search("base64") + 10, buffer.indexOf("-", buffer.search("base64")));
					console.log(enc);

					if (info.which === "")
						console.log(prefix + "Body [%s] (%d/%d)", inspect(info.which), count, info.size);
				});
				stream.once("end", function () {
					if (info.which !== "")
						console.log(prefix + "Parsed header: %s", inspect(Imap.parseHeader(buffer)));
					else
						console.log(prefix + "Body [%s] Finished", inspect(info.which));
				});
			});
			msg.once("attributes", function (attrs) {
				console.log(prefix + "Attributes: %s", inspect(attrs, false, 8));
			});
			msg.once("end", function () {
				console.log(prefix + "Finished");
			});
		});
		f.once("error", function (err) {
			console.log("Fetch error: " + err);
		});
		f.once("end", function () {
			console.log("Done fetching all messages!");
			imap.end();
		});
	});
});

imap.once("error", function (err) {
	console.log(err);
});

imap.once("end", function () {
	console.log("Connection ended");
});

imap.once("error", () => {
	console.log(imap.state);
});

imap.connect();