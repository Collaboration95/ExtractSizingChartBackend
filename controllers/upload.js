const uploadRouter = require("express").Router();
const multer = require("multer");
const config = require("../utils/config");
const { promises: fs } = require('fs');
const Bottleneck = require("bottleneck");
const upload = multer({ dest: "uploads/" });
const {
  TextractClient,
  AnalyzeDocumentCommand,
} = require("@aws-sdk/client-textract");

const textractClient = new TextractClient(config.awsConfig);

const limiter = new Bottleneck({
  minTime: 200, // Minimum time between requests (200 ms)
  maxConcurrent: 5, // Maximum concurrent requests
});


async function extractTableFromImage(filePath) {
    try {
        const fileBytes = await fs.readFile(filePath);
        const params = {
          Document: {
            Bytes: fileBytes,
          },
          FeatureTypes: [
            "TABLES",
          ],
        };
    
        const command = new AnalyzeDocumentCommand(params);
        // const response = await textractClient.send(command);
        const response = await limiter.schedule(() => textractClient.send(command));
        // Return the entire response, which includes all detected elements
        return response;
      } catch (error) {
        console.error("Error analyzing image:", error);
        throw error;
      }
}

uploadRouter.post("/", upload.array("images", 10), async (req, res) => {
    const files = req.files;
    
    // Check if any files were uploaded
    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded." });
    }
  
    // Verify the number of images uploaded
    const numberOfImages = files.length;
    const processedResults = [];
  
    try {
      // Use Promise.all to wait for all file processing to complete
      await Promise.all(files.map(async (file) => {
        const fileSizeInMB = file.size / (1024 * 1024); // converting bytes to MB
  
        if (fileSizeInMB < config.MAX_FILE_SIZE) {
          try {
            const tableData = await extractTableFromImage(file.path);
            processedResults.push({
              fileName: file.originalname,
              tableData,
            });
            
            await fs.unlink(file.path);
          } catch (error) {
            console.error("Error processing image:", error);
            processedResults.push({
              fileName: file.originalname,
              error: error.message,
            });
          }
        } else {
          processedResults.push({
            fileName: file.originalname,
            error: "File size exceeds the maximum limit",
          });
        }
      }));
  
      console.log(processedResults.length);
      res.status(200).json({
        message: `Successfully processed ${numberOfImages} images.`,
        numberOfImages,
        results: processedResults,
      });
    } catch (error) {
      console.error("Error processing files:", error);
      res.status(500).json({
        message: "An error occurred while processing the files",
        error: error.message,
      });
    }
  });
  


module.exports = uploadRouter;
