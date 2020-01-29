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
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class DeleteGebruiker
    {
        [FunctionName("DeleteGebruiker")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "delete", Route = "gebruikers")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient client = cloudStorageAccount.CreateCloudTableClient();
                CloudTable cloudTableGebruikers = client.GetTableReference("gebruikers");
                if (!await cloudTableGebruikers.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
                string gebruikerId = req.Query["gebruikerId"];
                if (gebruikerId != null && gebruikerId != "")
                {
                    TableQuery<GebruikerEntity> tableQueryLeerling = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("RowKey", QueryComparisons.Equal, gebruikerId));
                    TableQuerySegment<GebruikerEntity> resultLeerling = await cloudTableGebruikers.ExecuteQuerySegmentedAsync(tableQueryLeerling, null);
                    if (resultLeerling.Results.Count == 0) return new OkObjectResult("Er is geen gebruiker met die id");
                    GebruikerEntity gebruikerEntityLeerling = resultLeerling.Results[0];
                    if (gebruikerEntityLeerling.TypeGebruiker.ToLower() == "leerkracht") return new OkObjectResult("Om een leerkracht te verwijderen moet je een andere endpoint gebruiken");
                    TableOperation tableOperationLeerling = TableOperation.Delete(gebruikerEntityLeerling);
                    await cloudTableGebruikers.ExecuteAsync(tableOperationLeerling);
                    return new OkObjectResult("De leerling is verwijderd");
                }
                string json = await new StreamReader(req.Body).ReadToEndAsync();
                if (json == null || json == "") return new OkObjectResult("Er kan geen json gevonden worden");
                Gebruiker gebruiker = JsonConvert.DeserializeObject<Gebruiker>(json);
                if (gebruiker.Naam == null || gebruiker.Naam == "") return new OkObjectResult("Parameter \"naam\" moet opgegeven worden");
                if (gebruiker.Wachtwoord == null || gebruiker.Wachtwoord == "") return new OkObjectResult("Parameter \"wachtwoord\" moet opgegeven worden");
                TableQuery<GebruikerEntity> tableQueryLeerkracht = new TableQuery<GebruikerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, gebruiker.Naam));
                TableQuerySegment<GebruikerEntity> resultLeerkracht = await cloudTableGebruikers.ExecuteQuerySegmentedAsync(tableQueryLeerkracht, null);
                if (resultLeerkracht.Results.Count == 0) return new OkObjectResult("Er is geen gebruiker met die naam");
                GebruikerEntity gebruikerEntityLeerkracht = resultLeerkracht.Results[0];
                if (gebruikerEntityLeerkracht.TypeGebruiker.ToLower() == "leerling") return new OkObjectResult("Om een leerling te verwijderen moet je een andere endpoint gebruiken");
                if (gebruiker.Wachtwoord != gebruikerEntityLeerkracht.Wachtwoord) return new OkObjectResult("Het opgegeven wachtwoord is niet juist");
                TableOperation tableOperationLeerkracht = TableOperation.Delete(gebruikerEntityLeerkracht);
                await cloudTableGebruikers.ExecuteAsync(tableOperationLeerkracht);
                CloudTable cloudTableVragen = client.GetTableReference("vragen");
                if (await cloudTableVragen.ExistsAsync())
                {
                    TableQuery<VraagEntity> tableQueryVragen = new TableQuery<VraagEntity>().Where(TableQuery.GenerateFilterCondition("LeerkrachtNaam", QueryComparisons.Equal, gebruiker.Naam));
                    TableQuerySegment<VraagEntity> resultVragen = await cloudTableVragen.ExecuteQuerySegmentedAsync(tableQueryVragen, null);
                    List<VraagEntity> vraagEntities = resultVragen.Results;
                    if (vraagEntities.Count > 0)
                    {
                        for (int i = 0; i < vraagEntities.Count; i++)
                        {
                            TableOperation tableOperationVragen = TableOperation.Delete(vraagEntities[i]);
                            await cloudTableVragen.ExecuteAsync(tableOperationVragen);
                        }
                    }
                }
                return new OkObjectResult("De leerkracht is verwijderd");
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
