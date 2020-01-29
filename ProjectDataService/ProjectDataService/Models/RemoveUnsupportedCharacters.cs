namespace ProjectDataService.Models
{
    public class RemoveUnsupportedCharacters
    {
        public string Result { get; set; }
        public RemoveUnsupportedCharacters(string str)
        {
            if (str != null) Result = str.Replace("/", "").Replace("\\", "").Replace("#", "").Replace("?", ""); 
        }
    }
}
