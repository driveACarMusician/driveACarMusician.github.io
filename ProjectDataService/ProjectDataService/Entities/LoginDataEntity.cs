using Microsoft.WindowsAzure.Storage.Table;
using ProjectDataService.Models;

namespace ProjectDataService.Entities
{
    public class LoginDataEntity : TableEntity
    {
        public string Wachtwoord { get; set; }

        public LoginDataEntity(string id, string naam, string newPassword)
        {
            RowKey = new RemoveUnsupportedCharacters(id).Result;
            PartitionKey = new RemoveUnsupportedCharacters(naam).Result;
            Wachtwoord = newPassword;
        }
    }
}
