const taskTitle = document.getElementById("taskTitle");
        const projectName = document.getElementById("projectName");
        const taskStatus = document.getElementById("taskStatus");
        const addTaskBtn = document.getElementById("addTaskBtn");
        const sortBtn = document.getElementById("sortBtn");
        const board = document.getElementById("board");

        let tasks = JSON.parse(localStorage.getItem("kanbanTasks")) || [];
        let viewBy = 'status';

        function uid() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        }

        function normalizeStatus(status) {
            return status.toLowerCase().replace(/\s+/g, "");
        }

        function createColumn(group) {
            if (document.getElementById(group)) return;

            const column = document.createElement("div");
            column.className = "flex-1 bg-white rounded-2xl shadow-lg p-3 flex flex-col min-w-[250px]";

            column.innerHTML = `
                <h3 class="font-bold text-center mb-3 capitalize">${group}</h3>
                <div id="${group}" class="flex-1 flex flex-col gap-2"
                     ondragover="event.preventDefault()"
                     ondrop="dropTask(event, '${group}')"></div>
            `;

            board.appendChild(column);
        }

        function render() {
            board.innerHTML = "";
            let groups;
            if (viewBy === 'status') {
                groups = [...new Set(tasks.map(t => t.status))];
            } else {
                groups = [...new Set(tasks.map(t => t.project || 'General'))];
            }
            groups.forEach(createColumn);

            tasks.forEach(task => {
                let colId;
                if (viewBy === 'status') {
                    colId = task.status;
                } else {
                    colId = task.project || 'General';
                }
                const col = document.getElementById(colId);
                if (col) {
                    const card = document.createElement("div");
                    card.className = "task relative bg-gray-50 p-3 rounded-xl shadow cursor-move hover:scale-105 transition";
                    card.draggable = true;
                    card.ondragstart = e => e.dataTransfer.setData("id", task.id);

                    card.innerHTML = `
                        <div class="font-semibold">${task.title}</div>
                        

                        <div class="flex justify-between mt-2 text-sm">
                            <span class="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-full">
                            ${viewBy === 'status' ? (task.project || 'General') : task.status}
                        </span>
                            <button onclick="editTask('${task.id}')" class="text-indigo-600">Edit</button>
                            <button onclick="deleteTask('${task.id}')" class="text-red-500">Delete</button>
                        </div>
                    `;

                    col.appendChild(card);
                }
            });
        }

        addTaskBtn.onclick = () => {
            if (!taskTitle.value || !taskStatus.value) return;

            tasks.push({
                id: uid(),
                title: taskTitle.value,
                project: projectName.value,
                status: normalizeStatus(taskStatus.value)
            });

            save();
            render();

            taskTitle.value = "";
            projectName.value = "";
            taskStatus.value = "";
        };

        sortBtn.onclick = () => {
            viewBy = viewBy === 'status' ? 'project' : 'status';
            sortBtn.textContent = viewBy === 'status' ? 'Sort by Project' : 'Sort by Status';
            render();
        };

        function editTask(id) {
            const t = tasks.find(x => x.id === id);
            if (!t) return;

            const title = prompt("Edit title", t.title);
            const project = prompt("Edit project", t.project);
            const status = prompt("Edit status", t.status);

            if (title !== null) t.title = title;
            if (project !== null) t.project = project;
            if (status !== null) t.status = normalizeStatus(status);

            save();
            render();
        }

        function deleteTask(id) {
            tasks = tasks.filter(t => t.id !== id);
            save();
            render();
        }

        function dropTask(e, group) {
            const id = e.dataTransfer.getData("id");
            const t = tasks.find(x => x.id === id);
            if (t) {
                if (viewBy === 'status') {
                    t.status = group;
                } else {
                    t.project = group;
                }
                save();
                render();
            }
        }

        render();

        function updateGMTTime() {
            const now = new Date();
            const gmtString = now.toUTCString(); // GMT format
            document.getElementById("gmtTime").textContent = `Current GMT Time: ${gmtString}`;
        }

        // Initial call
        updateGMTTime();

        // Update every second
        setInterval(updateGMTTime, 1000);
