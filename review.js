$(document).ready(function() {
	$('#avgRating').raty({readOnly: true, half: true});
	$('#setRating').raty();
	Parse.initialize("2eTScImxk7ouAbp2Wjpbcd9U40fPRXxiFUEFdZZs", "o6uzMzrd0k6EoT4OOlVfOcqqdjBLGBQLmw1yX0ko");

	var Review = Parse.Object.extend("Review");
	getReviews();



	//Saves form inputs to Parse on form submit
	$('form').submit(function() {
		var NewReview = new Review();
		var title = $('#title').val();
		var content = $('#content').val();
		var rating = $('#setRating').raty('score');
		if (title == "" || content == "" || rating == null) {
			alert("One or more fields is empty");
		}else{
			rating = Number(rating);
			NewReview.set({'Title': title, 'Content': content, 'Rating': rating, 'Upvotes': 0, 'TotalVotes': 0});
			NewReview.save();
			getReviews();
		}
		
		return false;
	});

	function getReviews() {
		var query = new Parse.Query(Review);
		query.find({
			success:function(results) {
				buildReviews(results);
			}
		});
	}

	function buildReviews(results) {
		$('#reviews').empty();
		var ratingTotal = 0;
		for(var i =0; i < results.length; i++) {
			var review = results[i];
			var rating = review.get('Rating');
			ratingTotal += rating;
			var title = review.get('Title');
			var content = review.get('Content');
			var numUpvotes = review.get('Upvotes');
			var totalVotes = review.get('TotalVotes')
			var id = review.id;
			var div = $('<div class="container review">').appendTo($('#reviews'));
			div.attr("id", id);
			var ratyDiv = $('<div>').appendTo(div);
			var titleDiv = $('<h3 class="reviewTitle">').text(title).appendTo(div)
			ratyDiv.raty({readOnly: true, score: rating});
			var contentDiv = $('<div class="reviewContent">').text(content).appendTo(div);
			var voteDiv = $('<div class="vote">').appendTo(div);
			var upvote = $('<img src="upvote.gif" class="upvote">').appendTo(voteDiv);
			upvote.bind('click', sendUpvote);
			var downvote = $('<img src="downvote.gif" class="downvote">').appendTo(voteDiv);
			downvote.bind('click', sendDownvote);
			var helpful = $('<div class="helpful">').text(numUpvotes + " out of " + totalVotes + " found this review helpful.").appendTo(div);
			var deleteButton = $('<button class="delete">Delete</button>').appendTo(div);
			deleteButton.bind('click', deleteReview);

		}
		var ratingAvg = ratingTotal / results.length;
		ratingAvg = Math.round(ratingAvg * 2) / 2;
		$('#avgRating').raty({score: ratingAvg});
	}

	function sendUpvote() {

		var parentDiv = $(this).parent().parent();
		var id = parentDiv.attr('id');
		var query = new Parse.Query(Review);
		query.get(id, {
			success:function(result) {
				result.increment('Upvotes');
				result.increment('TotalVotes');
				result.save()
			}
		});
		getReviews();
	}

	function sendDownvote() {
		var parentDiv = $(this).parent().parent();
		var id = parentDiv.attr('id');
		var query = new Parse.Query(Review);
		query.get(id, {
			success:function(result) {
				result.increment('TotalVotes');
				result.save();
			}
		});
		getReviews();
	}

	function deleteReview() {
		var review = $(this).parent();
		var id = review.attr('id');
		var query = new Parse.Query(Review);
		query.get(id, {
			success:function(result) {
				result.destroy({
					success: function() {
						getReviews();
					}
				});
			}
		});
	}
});