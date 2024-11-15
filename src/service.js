import fs from "fs";

export function listener(req, res) {

    fs.readFile('./sss.html', 'utf8', function (err, data) {
        if (err) {
            res.writeHead(404, {'Content-Type': 'text/plain'});
        }else {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        }
    })
}
