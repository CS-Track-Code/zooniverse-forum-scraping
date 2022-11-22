import fetch from 'node-fetch';

async function getcomments(list, discussionsCollection, commentsCollection, params) {
    for (let i = 0; i < list.length; i++) {
        const discussion = list[i];
        let comments = [];
        let page = 0;
        console.log(`Getting comments for discussion ${discussion.title} of project ${discussion.project_slug}`);
        do {
            page++;
            let response = await fetch(`https://talk.zooniverse.org/comments?http_cache=true&discussion_id=${discussion.id}&page_size=100&page=${page}`, params);
            if (response.status == 200) {
                response = await response.json();
                comments = comments.concat(response.comments);
            }
        } while(comments.length >= 100*page );
        if (comments.length > 0) {
            commentsCollection.insertMany(comments);
            discussionsCollection.updateOne({id: discussion.id},{
                $set: {updated: 1}
            });
        }
    }
}

export function getComments(dbo, params, discussion_size) {
    var DiscussionsCollection = dbo.collection("Discussions");
    var CommentsCollection = dbo.collection("Comments");
    DiscussionsCollection.find({"comments_count": {"$gte": discussion_size}, "updated": null},{title: 1, project_slug: 1, id: 1}).toArray().then(projects => {
        console.log(`collection reached... process will start...`);
        getcomments(projects, DiscussionsCollection, CommentsCollection, params).then(()=>{
            console.log("Process finished");
            process.exit();
        }).catch(err => {
            console.log("ERROR: error requesting detailed info for projects", err);
            process.exit();
        });
    });
}
