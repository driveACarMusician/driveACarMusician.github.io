using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using ProjectDataService.Entities;
using ProjectDataService.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Tasks;

namespace ProjectDataService
{
    public static class GetLeaderboard
    {
        [FunctionName("GetLeaderboard")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "leaderboard")] HttpRequest req,
            ILogger log)
        {
            try
            {
                string connectionString = Environment.GetEnvironmentVariable("ConnectionString");
                CloudStorageAccount cloudStorageAccount = CloudStorageAccount.Parse(connectionString);
                CloudTableClient cloudTableClient = cloudStorageAccount.CreateCloudTableClient();
                CloudTable cloudTable = cloudTableClient.GetTableReference("Gebruikers");
                if (!await cloudTable.ExistsAsync()) return new OkObjectResult("Er zijn nog geen gebruikers");
                TableQuery<GebruikerEntity> tableQuery = new TableQuery<GebruikerEntity>();
                TableQuerySegment<GebruikerEntity> result = await cloudTable.ExecuteQuerySegmentedAsync(tableQuery, null);
                if (result.Results.Count > 0)
                {
                    List<Leaderboard> leaderboardInfo = new List<Leaderboard>();
                    List<GebruikerEntity> gebruikerEntities = result.Results;
                    foreach (GebruikerEntity gebruikerEntity in gebruikerEntities)
                    {
                        if (gebruikerEntity.Scores != null)
                        {
                            MemoryStream stream = new MemoryStream();
                            BinaryFormatter binaryFormatter = new BinaryFormatter();
                            stream.Write(gebruikerEntity.Scores, 0, gebruikerEntity.Scores.Length);
                            stream.Position = 0;
                            List<int> scores = binaryFormatter.Deserialize(stream) as List<int>;
                            if (scores.Count > 0)
                            {
                                int maxScore = scores.Max();
                                Leaderboard leaderboardItem = new Leaderboard(Guid.Parse(gebruikerEntity.RowKey), gebruikerEntity.PartitionKey, maxScore, gebruikerEntity.Avatar);
                                leaderboardInfo.Add(leaderboardItem);
                            }
                        }
                    }
                    if (leaderboardInfo.Count > 0)
                    {
                        List<Leaderboard> leaderboardInfoFinal = leaderboardInfo.OrderBy(item => item.MaxScore).Reverse().ToList().GetRange(0, 5);
                        return new OkObjectResult(leaderboardInfoFinal);
                    }
                }
                return new OkObjectResult("Er is nog geen leaderboard data");
            }
            catch (Exception ex)
            {
                return new StatusCodeResult(500);
            }
        }
    }
}
