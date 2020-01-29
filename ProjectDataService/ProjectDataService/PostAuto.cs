using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using ProjectDataService.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class PostAuto
    {
        [FunctionName("PostAuto")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "autos")] HttpRequest req,
            ILogger log)
        {
            try
            {
                if (req.ContentType == null) return new OkObjectResult("Could not find an image");
                if (req.Body.Length > 10000000) return new OkObjectResult("Image size has to be less than 10 MB");
                string[] contentTypeSplitted = req.ContentType.Split("/");
                string fileExtension = contentTypeSplitted[1];
                List<string> imageExtensions = new List<string>() { "jpeg", "png", "gif", "svg+xml" }; //jpg is not here because the content type for jpg is image/jpeg
                if (!imageExtensions.Contains(fileExtension)) return new OkObjectResult("The image type has to be jpg, jpeg, png, svg or gif");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();
                CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference("autos");
                await cloudBlobContainer.CreateIfNotExistsAsync();
                string fileName = new RemoveUnsupportedCharacters($"{Guid.NewGuid().ToString()}.{fileExtension}").Result;
                CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName);
                await cloudBlockBlob.UploadFromStreamAsync(req.Body);
                return new OkObjectResult(cloudBlockBlob.Uri.ToString().Replace("{", "").Replace("}", "")); //return url to the blob file
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
