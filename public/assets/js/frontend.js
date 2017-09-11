$("#refreshButton").click(function() {
	$.get( "/get538", function( data ) {
		window.location.replace("/");
	});
});

$("#backButton").click(function() {
	window.location.href = "/";
});

var viewCommentsPage = function(btn, event) {
	event.preventDefault();
	//console.log($(btn).attr("data-objectid"))-;
	window.location.href = "/email/" + $(btn).attr("data-object-id");
}

var deleteComment = function(btn, event) {
	event.preventDefault();
	//console.log(btn);
	var commentId = $(btn).attr("data-comment-id");
	$.ajax({
		url: "/delete/" + '?' + $.param({"commentId": commentId}),
		type: 'DELETE',
		success: function(data) {
			$(btn).closest(".commentDiv").remove();
			//console.log(data);
		},
		error: function(error) {
			console.log(error); 
		}
	});
}