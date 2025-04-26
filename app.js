document.addEventListener('DOMContentLoaded', () => {
    // Configuración inicial
    let tasks = JSON.parse(localStorage.getItem('kanbanTasks')) || {
        1: { id: 1, title: 'Recolección de requisitos', componente: 'planificación', detalles: 'Definir funcionalidades esenciales del sistema', status: 'pending' },
        2: { id: 2, title: 'Diseño de arquitectura técnica', componente: 'planificación', detalles: 'Seleccionar stack tecnológico (Node.js, React, PostgreSQL)', status: 'pending' },
        3: { id: 3, title: 'Crear diagrama ER', componente: 'planificación', detalles: 'Diseñar diagrama Entidad-Relación', status: 'pending' },
        4: { id: 4, title: 'Prototipado de interfaces', componente: 'planificación', detalles: 'Crear prototipos de las interfaces de usuario', status: 'pending' },
        5: { id: 5, title: 'Configuración inicial de BD', componente: 'base-datos', detalles: 'Configurar servidor y entorno de base de datos', status: 'pending' }
    };

    // Elementos del DOM
    const addTaskButton = document.getElementById('addTaskButton');
    const taskModal = document.getElementById('taskModal');
    const closeModal = document.querySelector('.close-modal');
    const taskForm = document.getElementById('taskForm');

    // Generar ID único
    const generateId = () => Date.now();

    // Guardar tareas en localStorage
    const saveTasks = () => {
        localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
    };

    // Renderizar tareas
    const renderTasks = () => {
        document.querySelectorAll('.kanban-column .tasks-container').forEach(container => {
            container.innerHTML = '';
            const status = container.parentElement.dataset.status;
            
            Object.values(tasks)
                .filter(task => task.status === status)
                .forEach(task => {
                    const taskElement = createTaskElement(task);
                    container.appendChild(taskElement);
                });
        });
    };

    // Crear elemento de tarea
    const createTaskElement = (task) => {
        const taskDiv = document.createElement('div');
        taskDiv.className = 'task-card';
        taskDiv.draggable = true;
        taskDiv.dataset.id = task.id;
        taskDiv.setAttribute('data-componente', task.componente);
        
        taskDiv.innerHTML = `
            <div class="task-header">
                <span class="editable-title">${task.title}</span>
                <div class="task-actions">
                    <button class="edit-btn">✏️</button>
                    <button class="delete-btn">🗑️</button>
                </div>
            </div>
            <span class="toggle-details">+</span>
            <div class="task-details">
                <strong>Componente:</strong> ${task.componente.toUpperCase()}<br>
                <strong>Detalles:</strong> <span class="editable-details">${task.detalles}</span>
            </div>
        `;
        
        // Configurar eventos
        setupTaskEvents(taskDiv, task.id);
        return taskDiv;
    };

    // Configurar eventos de tarea
    const setupTaskEvents = (taskElement, taskId) => {
        // Edición
        taskElement.querySelector('.editable-title').addEventListener('dblclick', () => {
            const newTitle = prompt('Editar título:', tasks[taskId].title);
            if (newTitle && newTitle.trim()) {
                tasks[taskId].title = newTitle.trim();
                saveTasks();
                renderTasks();
            }
        });

        // Eliminación
        taskElement.querySelector('.delete-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('¿Eliminar esta tarea permanentemente?')) {
                delete tasks[taskId];
                saveTasks();
                renderTasks();
            }
        });

        // Toggle detalles
        taskElement.querySelector('.toggle-details').addEventListener('click', (e) => {
            const task = e.target.closest('.task-card');
            task.classList.toggle('show');
            e.target.textContent = task.classList.contains('show') ? '-' : '+';
        });

        // Drag and Drop
        taskElement.addEventListener('dragstart', () => {
            taskElement.classList.add('dragging');
        });

        taskElement.addEventListener('dragend', () => {
            taskElement.classList.remove('dragging');
        });
    };

    // Configurar Drag and Drop para columnas
    document.querySelectorAll('.kanban-column').forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY);
            const draggable = document.querySelector('.dragging');
            
            if (draggable) {
                if (afterElement == null) {
                    container.querySelector('.tasks-container').appendChild(draggable);
                } else {
                    container.querySelector('.tasks-container').insertBefore(draggable, afterElement);
                }
                
                // Actualizar estado
                const taskId = draggable.dataset.id;
                tasks[taskId].status = container.dataset.status;
                saveTasks();
            }
        });
    });

    // Función auxiliar para Drag and Drop
    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    // Eventos del modal
    addTaskButton.addEventListener('click', () => {
        taskModal.style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        taskModal.style.display = 'none';
    });

    window.addEventListener('click', (e) => {
        if (e.target === taskModal) {
            taskModal.style.display = 'none';
        }
    });

    // Crear nueva tarea
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newTask = {
            id: generateId(),
            title: document.getElementById('taskTitle').value.trim(),
            componente: document.getElementById('taskComponent').value,
            detalles: document.getElementById('taskDetails').value.trim(),
            status: document.getElementById('taskStatus').value
        };

        if (newTask.title) {
            tasks[newTask.id] = newTask;
            saveTasks();
            renderTasks();
            taskModal.style.display = 'none';
            taskForm.reset();
        } else {
            alert('El título de la tarea es obligatorio');
        }
    });

    // Inicializar
    renderTasks();
});
