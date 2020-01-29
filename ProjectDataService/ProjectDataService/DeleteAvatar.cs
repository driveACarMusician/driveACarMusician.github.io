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
    public static class DeleteAvatar
    {
        [FunctionName("DeleteAvatar")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "avatars")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string avatarId = req.Query["avatarId"];
                if (avatarId == null || avatarId == "") return new OkObjectResult("Parameter \"avatarId\" moet opgegeven worden");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();
                CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference("avatars");
                if (!await cloudBlobContainer.ExistsAsync()) return new OkObjectResult("Er zijn nog geen avatars");
                BlobResultSegment blobResultSegment = await cloudBlobContainer.ListBlobsSegmentedAsync(null, true, BlobListingDetails.None, 500, null, null, null, CancellationToken.None);
                List<string> blobNames = blobResultSegment.Results.OfType<CloudBlockBlob>().Select(blob => blob.Name).ToList();
                string fileName = "";
                foreach (string blobName in blobNames)
                {
                    if (blobName.Contains(avatarId))
                    {
                        fileName = blobName;
                        break;
                    }
                }
                CloudBlockBlob cloudBlockBlob = cloudBlobContainer.GetBlockBlobReference(fileName);
                await cloudBlockBlob.DeleteIfExistsAsync();
                return new OkObjectResult($"Avatar {avatarId} is verwijderd");
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
