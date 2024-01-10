(() => {
  // Enums
  enum NotificationPlatform {
    SMS = "SMS",
    EMAIL = "EMAIL",
    PUSH_NOTIFICATION = "PUSH_NOTIFICATION",
  }

  enum ViewMode {
    TODO = "TODO",
    REMINDER = "REMINDER",
  }

  // Utils
  const DateUtils = {
    tomorrow(): Date {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    },
    today(): Date {
      return new Date();
    },
    formatDate(date: Date): string {
      return `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    },
  };
  // Criar ID
  const UUID = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };
  // Interfaces
  interface Task {
    id: string;
    dateCreated: Date;
    dateUpdated: Date;
    description: string;
    render(): string;
  }

  class Reminder implements Task {
    id: string = UUID();
    dateCreated: Date = DateUtils.today();
    dateUpdated: Date = DateUtils.today();
    description: string = "";

    date: Date = DateUtils.tomorrow();
    notifications: Array<NotificationPlatform> = [NotificationPlatform.EMAIL];

    constructor(
      description: string,
      date: Date,
      notifications: Array<NotificationPlatform>
    ) {
      this.description = description;
      this.date = date;
      this.notifications = notifications;
    }

    render(): string {
      return `
      ---> Reminder <--- \n
      Description: ${this.description} \n
      Notify by ${this.notifications.join(" and ")} in ${DateUtils.formatDate(
        this.date
      )} \n
      Created: ${DateUtils.formatDate(
        this.dateCreated
      )} Last Update: ${DateUtils.formatDate(this.dateUpdated)}
      `;
    }
  }

  class Todo implements Task {
    id: string = UUID();
    dateCreated: Date = DateUtils.today();
    dateUpdated: Date = DateUtils.today();
    description: string = "";

    done: boolean = false;

    constructor(description: string) {
      this.description = description;
    }

    render(): string {
      const doneLabel = this.done ? "Completed" : "In Progress";
      return `
      ---> TODO <---
      Description: ${this.description} \n
      Status: ${doneLabel} \n
      Created: ${DateUtils.formatDate(
        this.dateCreated
      )} Last Updated: ${DateUtils.formatDate(this.dateUpdated)}
      `;
    }
  }

  const taskView = {
    getTodo(form: HTMLFormElement): Todo {
      const todoDescription = form.todoDescription.value;
      form.reset();
      return new Todo(todoDescription);
    },
    getReminder(form: HTMLFormElement): Reminder {
      const reminderNotifications = [
        form.notification.value as NotificationPlatform,
        // form.notifications.value as NotificationPlatform,
      ];
      const reminderDate = new Date(form.scheduleDate.value);
      const reminderDescription = form.reminderDescription.value;
      form.reset();
      return new Reminder(
        reminderDescription,
        reminderDate,
        reminderNotifications
      );
    },
    // METODO RENDER
    render(tasks: Array<Task>, mode: ViewMode) {
      const tasksList = document.getElementById("tasksList");
      while (tasksList?.firstChild) {
        tasksList.removeChild(tasksList.firstChild);
      }

      tasks.forEach((task) => {
        const li = document.createElement("LI");
        const textNode = document.createTextNode(task.render());
        li.appendChild(textNode);
        tasksList?.appendChild(li);
      });
      // SELETORES PARA REALIZAR A TROCA DO MODE
      const todoSet = document.getElementById("todoSet");
      const reminderSet = document.getElementById("reminderSet");
      // VALIDAR O MODE
      if (mode === ViewMode.TODO) {
        todoSet?.setAttribute("style", "display: block");
        todoSet?.removeAttribute("disabled");
        reminderSet?.setAttribute("style", "display: none");
        reminderSet?.setAttribute("disabled", "true");
      } else {
        reminderSet?.setAttribute("style", "display: block");
        reminderSet?.removeAttribute("disabled");
        todoSet?.setAttribute("style", "display: none");
        todoSet?.setAttribute("disabled", "true");
      }
    },
  };
  // CONTROLLER
  const TaskController = (view: typeof taskView) => {
    const tasks: Array<Task> = [];
    let mode: ViewMode = ViewMode.TODO;

    const handleEvent = (event: Event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      switch (mode as ViewMode) {
        case ViewMode.TODO:
          tasks.push(view.getTodo(form));
          break;
        case ViewMode.REMINDER:
          tasks.push(view.getReminder(form));
          break;
      }
      view.render(tasks, mode);
    };

    const handleToggleMode = () => {
      switch (mode as ViewMode) {
        case ViewMode.TODO:
          mode = ViewMode.REMINDER;
          break;
        case ViewMode.REMINDER:
          mode = ViewMode.TODO;
          break;
      }
      view.render(tasks, mode);
    };

    document
      .getElementById("toggleMode")
      ?.addEventListener("click", handleToggleMode);
    document
      .getElementById("taskForm")
      ?.addEventListener("submit", handleEvent);
  };

  TaskController(taskView);
})();
