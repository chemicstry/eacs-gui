export function JSON_stringify_unicode(s)
{
   var json = JSON.stringify(s);
   return json.replace(/[\u007f-\uffff]/g,
      function(c) { 
        return '\\u'+('0000'+c.charCodeAt(0).toString(16)).slice(-4);
      }
   );
}
