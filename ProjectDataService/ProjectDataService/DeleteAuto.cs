using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class DeleteAuto
    {
        [FunctionName("DeleteAuto")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "autos")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string autoId = req.Query["autoId"];
                if (autoId == null || autoId == "") return new OkObjectResult("Parameter \"autoId\" moet opgegeven worden");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();
                CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference("autos");
                if (!await cloudBlobContainer.ExistsAsync()) return new OkObjectResult("Er zijn nog geen autos");
                BlobResultSegment blobResultSegment = await cloudBlobContainer.ListBlobsSegmentedAsync(null, true, BlobListingDetails.None, 500, null, null, null, CancellationToken.None);
                List<string> blobNames = blobResultSegment.Results.OfType<CloudBlockBlob>().Select(blob => blob.Name).ToList();
                string fileName = "";
                foreach (string blobName in blobNames)
                {
                    if (blobName.Contains(autoId))
                    {
                        fileName = blobName;
                        break;
                    }
                }
                CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName);
                await cloudBlockBlob.DeleteIfExistsAsync();
                return new OkObjectResult($"Auto {autoId} is verwijderd");
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
