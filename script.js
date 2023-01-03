const form = document.querySelector("form");
const itemInput = document.querySelector("#taskInput");
const itemsList = document.querySelector("#taskList");
const filters = document.querySelectorAll(".nav li");
const alertDiv = document.querySelector("#message");

let todoItems = [];

const alertMessage = function (message, className) {
    alertDiv.innerHTML = message;
    alertDiv.classList.add(className, "show");
    alertDiv.classList.remove("hide");
    setTimeout(() => {
        alertDiv.classList.add("hide");
        alertDiv.classList.remove(className, "show");
    }, 3000)
}

const getItemsFilter = function (type) {
    let filterItems = [];
    switch (type) {
        case "todo":
            filterItems = todoItems.filter((item) => !item.isDone);
            break;
        case "done":
            filterItems = todoItems.filter((item) => item.isDone);
            break;
        default:
            filterItems = todoItems;
    }
    getList(filterItems);
}

const removeItem = function (item) {
    const removeIndex = todoItems.indexOf(item);
    todoItems.splice(removeIndex, 1);
}

const updateItem = function (currentItemIndex, value) {
    const newItem = todoItems[currentItemIndex];
    newItem.name = value;
    todoItems.splice(currentItemIndex, 1, newItem);
    setLocalStorage(todoItems);
}

const handleItem = function (itemData) {
    const items = document.querySelectorAll("#taskList li");
    items.forEach((item) => {

        if (item.querySelector(".title").getAttribute('data-time') == itemData.addedAt) {
            item.querySelector('[data-done]').addEventListener('click', function (e) {
                e.preventDefault();

                const itemIndex = todoItems.indexOf(itemData);
                const currentItem = todoItems[itemIndex];
                const currentClass = currentItem.isDone ? "bi-check-circle-fill" : "bi-check-circle";
                currentItem.isDone ? alertMessage(`Marked ${currentItem.name} as to do`, "danger") : alertMessage(`Marked ${currentItem.name} as done`, "success");
                currentItem.isDone = currentItem.isDone ? false : true;

                todoItems.splice(itemIndex, 1, currentItem);
                setLocalStorage(todoItems);

                const iconClass = currentItem.isDone ? "bi-check-circle-fill": "bi-check-circle";
                this.firstElementChild.classList.replace(currentClass, iconClass);
                const filterType = document.querySelector("#tabValue").value;
                getItemsFilter(filterType);
            });

            item.querySelector("[data-edit]").addEventListener("click", function (e) {
                e.preventDefault();
                itemInput.value = itemData.name;
                document.querySelector("#objIndex").value = todoItems.indexOf(itemData);
            });

            item.querySelector("[data-delete]").addEventListener("click", function (e) {
                e.preventDefault();
                if (confirm("Are you sure you want to remove this item?")) {
                    itemsList.removeChild(item);
                    removeItem(item);
                    setLocalStorage(todoItems);
                    alertMessage("Item has been deleted", "danger");
                    return todoItems.filter((item) => item != itemData);
                }
            });
        }
    })
};

const getList = function (todoItems) {
    itemsList.innerHTML = "";
    if (todoItems.length > 0) {
        todoItems.forEach((item) => {
            const iconClass = item.isDone ? "bi-check-circle-fill": "bi-check-circle";
            let liTag = `
            <li>
                <span class="title" data-time=${item.addedAt}>${item.name}</span>
                <span class="icons-list">
                    <a href="#" data-done><i class="bi ${iconClass} green"></i></a>
                    <a href="#" data-edit><i class="bi bi-pencil-square blue"></i></a>
                    <a href="#" data-delete><i class="bi bi-x-circle red"></i></a>
                </span>
            </li>`;
            itemsList.insertAdjacentHTML("beforeend", liTag);
            handleItem(item);
        });
    } else {
        let liTag = `<li class="norecord"><span>No Records Found</span></li>`;
        itemsList.insertAdjacentHTML("beforeend", liTag);
    }
}

const getLocalStorage = function () {
    const todoStorage = localStorage.getItem("todoItems");
    if (todoStorage === "undefined" || todoStorage === null) {
        todoItems = [];
    }
    else {
        todoItems = JSON.parse(todoStorage);
    }
    getList(todoItems);
}

const setLocalStorage = function (todoItems) {
    localStorage.setItem("todoItems", JSON.stringify(todoItems));
}

document.addEventListener("DOMContentLoaded", () => {
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const itemName = itemInput.value.trim();
        if (itemName.length === 0) {
            alertMessage("Please enter name", "info");
        }else{
            const currentItemIndex = document.querySelector("#objIndex").value;
            if (currentItemIndex) {
                updateItem(currentItemIndex, itemName);
                document.querySelector("#objIndex").value = "";
                alertMessage("Item has been updated", "success");
            }else{
                const itemObj = {
                    name: itemName,
                    isDone: false,
                    addedAt: new Date().getTime()
                };
                todoItems.push(itemObj);
                setLocalStorage(todoItems);
                alertMessage("New Item has been added", "success");
            }
            getList(todoItems);
        }
        itemInput.value = "";
    });

    filters.forEach((tab) => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            const tabType = this.getAttribute("data-type");
            filters.forEach((nav) => {
                nav.classList.remove("active");
            });
            this.classList.add("active");
            getItemsFilter(tabType);
            document.querySelector("#tabValue").value = tabType;
        });
    });
    getLocalStorage();
});