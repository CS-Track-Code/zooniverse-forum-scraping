import fetch from 'node-fetch';

const PROJECT_TYPE = ['live','paused','finished'];

async function getProjectList(project_type, params) {
    const projects = [];
    let response = await fetch(`https://www.zooniverse.org/api/projects?http_cache=true&page=1&sort=-launch_date&launch_approved=true&cards=true&include=avatar&state=${project_type}`, {
        ...params,
        headers: {
            ...params.headers,
            "sec-fetch-site": "same-origin"
        },
        "credentials": "include",
        "referrer": `https://www.zooniverse.org/projects?page=1&status=${project_type}`,
    });
    if (response.status == 200) {
        response = await response.json();
        const pageCount = response.meta.projects.page_count;
        for (let page=1; page<=pageCount; page++) {
            console.log(`getting projects from page ${page} for ${project_type}`);
            let pr = await fetch(`https://www.zooniverse.org/api/projects?http_cache=true&page=${page}&sort=-launch_date&launch_approved=true&cards=true&include=avatar&state=${project_type}`, {
                ...params,
                headers: {
                    ...params.headers,
                    "sec-fetch-site": "same-origin"
                },
                "credentials": "include",
                "referrer": `https://www.zooniverse.org/projects?page=${page}&status=${project_type}`,
            });
            if (pr.status == 200) {
                pr = await pr.json();
                pr.projects.forEach(project => {
                    projects.push(project);
                });
            }
        }
        return projects;
    }
    return [];
}

export function getProjects(dbo, params) {
    console.log('Dumping projects from Zooniverse website into the database...');
    let completed_types = 0;
    for (let i=0; i<PROJECT_TYPE.length; i++) {
        const type = PROJECT_TYPE[i];
        getProjectList(type, params).then(projectList => {
            projectList.forEach(project => {
                dbo.collection("Projects").findOne({id: project.id}).then(found => {
                    if (found) {
                        dbo.collection("Projects").updateOne({id: project.id}, {$set: project});
                    } else {
                        dbo.collection("Projects").insertOne(project);
                    }
                });
            });
        }).then(() => {
            completed_types++;
            if (completed_types == PROJECT_TYPE.length) {
                console.log('Process finished!');
                process.exit();
            }
        });
    }
}
