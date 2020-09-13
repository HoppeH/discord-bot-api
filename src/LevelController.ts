// const TaskDao = require("../models/TaskDao");

export class LevelController {

    private cosmosDb;
    /**
     * Handles the various APIs for displaying and managing tasks
     * @param {TaskDao} taskDao
     */
    constructor(_cosmoDb) {
        this.cosmosDb = _cosmoDb;
    }
    async showTasks(req, res) {
        console.log('ShowTasks')
        const querySpec = {
            query: "SELECT * FROM Users"
            // ,
            // parameters: [
            //     {
            //         name: "@completed",
            //         value: false
            //     }
            // ]
        };

        const items = await this.cosmosDb.find(querySpec);
        res.send(items)
    }

    async addTask(req, res) {
        const item = req.body;

        await this.cosmosDb.addItem(item);
        res.redirect("/");
    }

    async completeTask(req, res) {
        const completedTasks = Object.keys(req.body);
        const tasks = [];

        completedTasks.forEach(task => {
            tasks.push(this.cosmosDb.updateItem(task));
        });

        await Promise.all(tasks);

        res.redirect("/");
    }
}

export default LevelController;

