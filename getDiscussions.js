import fetch from 'node-fetch';

async function getDiscussionsList(list, discussionsCollection, projectsCollection, params) {
    for (let i = 0; i < list.length; i++) {
        const project = list[i];
        let discussions = [];
        let pending = [];
        for (let j = 0; j < project.boards.length; j++) {
            let boardDiscussions = [];
            let page = 0;
            console.log(`Getting discussions for board ${project.boards[j].title} of project ${project.link}`);
            do {
                page++;
                console.log(`-------------- page ${page} `);
                let response = await fetch(`https://talk.zooniverse.org/discussions?http_cache=true&board_id=${project.boards[j].id}&page_size=100&page=${page}`, params);
                if (response.status == 200) {
                    response = await response.json();
                    boardDiscussions = boardDiscussions.concat(response.discussions);
                }
            } while(boardDiscussions.length >= 100*page );
            discussions = discussions.concat(boardDiscussions);
        }

        if (discussions.length > 0) {
            discussionsCollection.insertMany(discussions);
            console.log(`Inserted ${discussions.length} discussions for project ${project.link}`);
        }
        if (pending.length > 0) {
            projectsCollection.updateOne({"id" : project.id}, [
                {$set: { updated: 4, pendingBoards: pending }}
            ]);
            console.log(`${pending.length} boards pending for project ${project.link}`);
        } else if (discussions.length > 0) {
            projectsCollection.updateOne({"id" : project.id}, {
                $set: { updated: 3 },
                $unset: { pendingBoards: 1}
            });
        }
    }
}


export function getDiscussions(dbo, params) {
    var ProjectsCollection = dbo.collection("Projects");
    var DiscussionsCollection = dbo.collection("Discussions");
    ProjectsCollection.find({"updated": null}).map(a => ({
        _id: a._id,
        id: a.id,
        link: a.slug,
        boards: a.boards
    })).toArray().then(projects => {
        getDiscussionsList(projects, DiscussionsCollection, ProjectsCollection, params).then(()=>{
            console.log("Process finished");
            process.exit();
        }).catch(err => {
            console.log("ERROR: error requesting detailed info for projects", err);
            process.exit();
        });
    });
}
