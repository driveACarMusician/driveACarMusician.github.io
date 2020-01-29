using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using Newtonsoft.Json;
using ProjectDataService.Entities;
using ProjectDataService.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class PostScore
    {
        [FunctionName("PostScore")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "post", Route = "scores")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string json = await new StreamReader(req.Body).ReadToEndAsync();
                PostScoreClass postScoreClass = JsonConvert.DeserializeObject<PostScoreClass>(json);
                if (postScoreClass == null) return new OkObjectResult("Er kan geen json gevonden worden");
                if (postScoreClass.Naam == null || postScoreClass.Naam == "") return new OkObjectResult("Naam werd niet opgegeven");
                if (postScoreClass.Score == null) return new OkObjectResult("Score werd niet opgegeven");
                if (postScoreClass.Score < 0) return new OkObjectResult("Score kan niet minder dan 0 zijn");
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient client = cloudStorageAccount.CreateCloudTableClient();
                CloudTable table = client.GetTableReference("Gebruikers");
                if (!await table.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
                TableQuery<GebruikerEntity> tableQueryAll = new TableQuery<GebruikerEntity>();
                TableQuerySegment<GebruikerEntity> resultAll = await table.ExecuteQuerySegmentedAsync(tableQueryAll, null);
                TableQuery<GebruikerEntity> tableQueryName = tableQueryAll.Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, postScoreClass.Naam));
                TableQuerySegment<GebruikerEntity> resultName = await table.ExecuteQuerySegmentedAsync(tableQueryName, null);
                if (resultName.Results.Count == 0) return new OkObjectResult("Deze gebruiker bestaat niet");
                GebruikerEntity gebruikerOld = new GebruikerEntity();
                for (int i = 0; i < resultAll.Results.Count; i++)
                {
                    if (resultAll.Results[i].PartitionKey == postScoreClass.Naam)
                    {
                        gebruikerOld = resultAll.Results[i];
                        break;
                    }
                }
                MemoryStream stream = new MemoryStream();
                BinaryFormatter binaryFormatter = new BinaryFormatter();
                stream.Write(gebruikerOld.Scores, 0, gebruikerOld.Scores.Length);
                stream.Position = 0;
                Gebruiker gebruiker = new Gebruiker()
                {
                    Id = Guid.Parse(gebruikerOld.RowKey),
                    Naam = postScoreClass.Naam,
                    Scores = binaryFormatter.Deserialize(stream) as List<int>,
                    TypeGebruiker = gebruikerOld.TypeGebruiker //we need this because GebruikerEntity can't do null.ToLower()
                };
                gebruiker.Scores.Add(postScoreClass.Score);
                GebruikerEntity gebruikerEntity = new GebruikerEntity(gebruiker.Id, gebruiker.Naam, gebruiker.Scores, gebruiker.Avatar, gebruiker.Auto, gebruiker.TypeGebruiker, gebruiker.Wachtwoord);
                TableOperation tableOperation = TableOperation.InsertOrMerge(gebruikerEntity);
                await table.ExecuteAsync(tableOperation);
                gebruiker.Avatar = gebruikerOld.Avatar;
                gebruiker.Auto = gebruikerOld.Auto;
                return new OkObjectResult(gebruiker);
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
