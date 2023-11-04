var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import _ from "lodash";
import { optimize } from "svgo";
import ora from "ora";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
function getIconInfoFromTxt(txtFilePath) {
    return __awaiter(this, void 0, void 0, function* () {
        const info = {};
        try {
            const content = yield fs.promises.readFile(txtFilePath, "utf-8");
            content.split("\n").forEach((line) => {
                const [key, value] = line.split("=").map((item) => item.trim());
                if (key === "title") {
                    info.title = value;
                }
                else if (key === "author") {
                    info.author = value;
                }
                else if (key === "keywords") {
                    info.keywords = value.split(",").map((keyword) => keyword.trim());
                }
            });
        }
        catch (error) {
            console.error(`Error reading file: ${txtFilePath}`);
        }
        return info;
    });
}
function createIconsJson(dirPath, outputPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = ora().start();
        let counter = 1;
        const icons = [];
        function processEntry(entryPath) {
            return __awaiter(this, void 0, void 0, function* () {
                const stats = yield fs.promises.stat(entryPath);
                if (stats.isFile()) {
                    const filename = path.basename(entryPath);
                    const ext = path.extname(filename).toLowerCase();
                    if ([".svg", ".jpg", ".png", ".gif", ".webp"].includes(ext)) {
                        const title = filename.replace(ext, "");
                        const hash = crypto
                            .createHash("md5")
                            .update(path.dirname(entryPath))
                            .digest("hex");
                        const uniqueCode = `${hash}-${_.kebabCase(title)}${ext}`;
                        const src = uniqueCode;
                        let content = yield fs.promises.readFile(entryPath, "utf-8");
                        if (ext === ".svg") {
                            const result = optimize(content, { path: entryPath });
                            content = result.data;
                        }
                        let additionalInfo = {};
                        let txtEntryPath = entryPath.replace(/\.[^.]+$/, ".txt");
                        let isTxtExist = fs.existsSync(txtEntryPath);
                        if (isTxtExist) {
                            additionalInfo = yield getIconInfoFromTxt(txtEntryPath);
                        }
                        const iconInfo = Object.assign({ filename,
                            src,
                            title }, additionalInfo);
                        icons.push(iconInfo);
                        const newFilePath = path.join(outputPath, uniqueCode);
                        yield fs.promises.writeFile(newFilePath, content);
                        spinner.text = `${counter} sukses!`;
                        counter++;
                    }
                }
                else if (stats.isDirectory()) {
                    const subEntries = yield fs.promises.readdir(entryPath);
                    for (const subEntry of subEntries) {
                        yield processEntry(path.join(entryPath, subEntry));
                    }
                }
            });
        }
        yield processEntry(dirPath);
        const chunkedIcons = [];
        while (icons.length > 0) {
            chunkedIcons.push(icons.splice(0, 2));
        }
        const indexJsonChunks = chunkedIcons.map((chunk, index) => ({
            icons: chunk,
            page: index + 1,
            nextPage: index < chunkedIcons.length - 1 ? index + 2 : null,
        }));
        for (const [index, chunk] of indexJsonChunks.entries()) {
            const indexJsonPath = path.join(outputPath, `index-${index + 1}.json`);
            yield fs.promises.writeFile(indexJsonPath, JSON.stringify(chunk, null, 4));
        }
        spinner.succeed(`${counter} Berhasil!`);
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const dirPath = path.join(__dirname, "../icons");
        const outputPath = path.join(__dirname, "../out");
        if (!fs.existsSync(outputPath)) {
            fs.mkdirSync(outputPath);
        }
        yield createIconsJson(dirPath, outputPath);
    });
}
main().catch((error) => console.error(error));
