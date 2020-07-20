const Manager = require("./lib/Manager");
const Engineer = require("./lib/Engineer");
const Intern = require("./lib/Intern");
const inquirer = require("inquirer");
const path = require("path");
const fs = require("fs");

// const OUTPUT_DIR = path.resolve(__dirname, "output");
// const outputPath = path.join(OUTPUT_DIR, "team.html");

const render = require("./lib/htmlRenderer");


// Write code to use inquirer to gather information about the development team members,
// and to create objects for each team member (using the correct classes as blueprints!)
var teamList = [];
const managerQuestions = [
    {
        type: "input",
        name: "name",
        message: "ENTER MANAGER NAME:",
        validate: async (input) => {
            if (input == "" || /\s/.test(input)) {
                return "Please enter first or last name.";
            }
            return true;
        }
    },
    {
        type: "input",
        name: "email",
        message: "ENTER E-MAIL:",
        validate: async (input) => {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input)) {
                return true;
            }
            return "Please enter a valid email address.";
        }
    },
    {
        type: "input",
        name: "officeNum",
        message: "ENTER OFFICE NUMBER:",
        validate: async (input) => {
            if (isNaN(input)) {
                return "Please enter a number";
            }
            return true;
        }
    },
    {
        type: "list",
        name: "hasTeam",
        message: "Do you have any team members?",
        choices: ["Yes", "No"]
    }
]
const employeeQuestions = [
    {
        type: "input",
        name: "name",
        message: "ENTER EMPLOYEE NAME:",
        validate: async (input) => {
            if (input == "") {
                return "Please enter a name.";
            }
            return true;
        }
    },
    {
        type: "input",
        name: "email",
        message: "ENTER E-MAIL:",
        validate: async (input) => {
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input)) {
                return true;
            }
            return "Please enter a valid email address.";
        }
    },
    {
        type: "list",
        name: "role",
        message: "EMPLOYEE ROLE?",
        choices: ["engineer", "intern"]
    },
    {
        when: input => {
            return input.role == "engineer"
        },
        type: "input",
        name: "github",
        message: "ENTER GITHUB USERNAME:",
        validate: async (input) => {
            if (input == "" || /\s/.test(input)) {
                return "Please enter a valid GitHub username";
            }
            return true;
        }
    },
    {
        when: input => {
            return input.role == "intern"
        },
        type: "input",
        name: "school",
        message: "ENTER SCHOOL NAME:",
        validate: async (input) => {
            if (input == "") {
                return "Please enter a name.";
            }
            return true;
        }
    },
    {
        type: "list",
        name: "addAnother",
        message: "Add another team member?",
        choices: ["Yes", "No"]
    }]
function buildTeamList() {
    inquirer.prompt(employeeQuestions).then(employeeInfo => {
        if (employeeInfo.role == "engineer") {
            var newMember = new Engineer(employeeInfo.name, teamList.length + 1, employeeInfo.email, employeeInfo.github);
        } else {
            var newMember = new Intern(employeeInfo.name, teamList.length + 1, employeeInfo.email, employeeInfo.school);
        }
        teamList.push(newMember);
        if (employeeInfo.addAnother === "Yes") {
            console.log(" ");
            buildTeamList();
        } else {
            buildHtmlPage();
        }
    })
}

function buildHtmlPage() {
    let newFile = fs.readFileSync("./templates/main.html")
    fs.writeFileSync("./output/team.html", newFile, function (err) {
        if (err) throw err;
    })

    console.log("Generated!");

    for (member of teamList) {
        if (member.getRole() == "Manager") {
            buildHtmlCard("manager", member.getName(), member.getId(), member.getEmail(), "Office: " + member.getOfficeNumber());
        } else if (member.getRole() == "Engineer") {
            buildHtmlCard("engineer", member.getName(), member.getId(), member.getEmail(), "Github: " + member.getGithub());
        } else if (member.getRole() == "Intern") {
            buildHtmlCard("intern", member.getName(), member.getId(), member.getEmail(), "School: " + member.getSchool());
        }
    }
    fs.appendFileSync("./output/team.html", "</div></main></body></html>", function (err) {
        if (err) throw err;
    });
    console.log("team.html created! ")

}

function buildHtmlCard(memberType, name, id, email, propertyValue) {
    let data = fs.readFileSync(`./templates/${memberType}.html`, 'utf8')
    data = data.replace("nameHere", name);
    data = data.replace("idHere", `ID: ${id}`);
    data = data.replace("emailHere", `Email: <a href="mailto:${email}">${email}</a>`);
    data = data.replace("propertyHere", propertyValue);
    fs.appendFileSync("./output/team.html", data, err => { if (err) throw err; })
    console.log("Card appended");
}

function init() {
    inquirer.prompt(managerQuestions).then(managerInfo => {
        let teamManager = new Manager(managerInfo.name, 1, managerInfo.email, managerInfo.officeNum);
        teamList.push(teamManager);
        console.log(" ");
        if (managerInfo.hasTeam === "Yes") {
            buildTeamList();    
        } else {
            buildHtmlPage();
        }
    })
}

init();