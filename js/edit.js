$(document).ready(function(){
    var container=$('.bootstrap-iso form').length>0 ? $('.bootstrap-iso form').parent() : "body";
    $( "#taskid" ).change(function() {
        var taskid =$( "select#taskid option:checked" ).val();
        var request = $.ajax({
            url:"/gettaskdetail",
            type:"POST",
            data:{id:taskid}
        });
        request.done(function(data){
            var task = JSON.parse(data);
            var name = task['name'];
            var desc = task['description'];
            var course = task ['taskcourse'];
            var date = task['taskdate'];
            console.log(name);
            $('#taskname').val(name);
            $('#taskdesc').val(desc);
            $('#taskcourse').val(course);
            $('#taskdate').val(date);

        });
        
      });
    
});