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
    public static class GetAutos
    {
        [FunctionName("GetAutos")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "autos")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudBlobClient cloudBlobClient = cloudStorageAccount.CreateCloudBlobClient();
                CloudBlobContainer cloudBlobContainer = cloudBlobClient.GetContainerReference("autos");
                if (!await cloudBlobContainer.ExistsAsync()) return new OkObjectResult("Er zijn nog geen autos");
                BlobResultSegment blobList = await cloudBlobContainer.ListBlobsSegmentedAsync(null, true, BlobListingDetails.None, 500, null, null, null, CancellationToken.None);
                List<string> blobUrls = blobList.Results.OfType<CloudBlockBlob>().Select(blob => blob.Uri.ToString().Replace("{", "").Replace("}", "")).ToList();
                return new OkObjectResult(blobUrls);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
