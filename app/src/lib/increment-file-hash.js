import SparkMD5 from "spark-md5";

const incrementFileHash = (file, cb = () => {}, batch) => {
    return new Promise((resolve, reject) => {
        try {
            var blobSlice =
                    File.prototype.slice ||
                    File.prototype.mozSlice ||
                    File.prototype.webkitSlice,
                chunkSize = 2097152, // Read in chunks of 2MB
                chunks = Math.ceil(file.size / chunkSize),
                currentChunk = 0,
                spark = new SparkMD5.ArrayBuffer(),
                fileReader = new FileReader();

            fileReader.onload = function (e) {
                // console.log("read chunk nr", currentChunk + 1, "of", chunks);
                spark.append(e.target.result); // Append array buffer
                currentChunk++;

                if (currentChunk < chunks) {
                    loadNext();
                    cb.call(null, currentChunk / chunks, { type: "part", file, batch });
                } else {
                    // console.log("finished loading");
                    batch.processedFiles++;
                    cb.call(null, currentChunk / chunks, {
                        type: "complete",
                        file,
                        batch
                    });
                    resolve(spark.end()); // Compute hash
                }
            };

            fileReader.onerror = () => {
                reject("oops, something went wrong.");
            };

            const loadNext = () => {
                var start = currentChunk * chunkSize,
                    end = start + chunkSize >= file.size ? file.size : start + chunkSize;

                fileReader.readAsArrayBuffer(blobSlice.call(file, start, end));
            };

            loadNext();
        } catch (e) {
            reject(e);
        }
    });
};

export default incrementFileHash;
