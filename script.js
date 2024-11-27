import fs from "fs";
import ipp from "ipp";

const printer = ipp.Printer("http://localhost:631/printers/XP-320-2");

const message = {
    "operation-attributes-tag": {
        "requesting-user-name": "Admin",
        "job-name": "Print Job",
        "document-format": "application/pdf"
    },
    data: fs.readFileSync("./file.pdf")
};

printer.execute("Print-Job", message, (error, response) => {
    if (error) {
        console.error(error);
    } else {
        console.log(response);
    }
});
