//////////////////////////
//////////////////////////
//// GENERAL SETTINGS ////
//////////////////////////
//////////////////////////

//////////////////////////////
// Globals for multi purpose//
//////////////////////////////

let savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
savedTasks.forEach(addTask);

setTasksId();

itemsCounter();

let savedChecked = JSON.parse(localStorage.getItem("checked")) || [];
savedChecked.forEach(checkedItems); // This thing uses tasks.id, so setTasksId() should be first

activeTaskFilter(); // visualize filter buttons on startup

/////////////////////////////////
// Sets color scheme on startup//
/////////////////////////////////

const colorScheme = localStorage.getItem("color-scheme") || getPreferredColorScheme();
document.documentElement.setAttribute("data-color-scheme", colorScheme);

//////////////////////////
//////////////////////////
//// GENERAL FUNCTIONS////
//////////////////////////
//////////////////////////

////////////////////////////////////////////////
// Sets preferred or user chosen color scheme //
////////////////////////////////////////////////

function getPreferredColorScheme () {
  const darkQuery = "(prefers-color-scheme: dark)";
  const darkMQL = window.matchMedia ? window.matchMedia(darkQuery) : {};
  if (darkMQL.media === darkQuery && darkMQL.matches) {
    return "dark";
  }
  return "default";
};

///////////////////////////////
// Template for task element //
///////////////////////////////

function addTask(text) {
  const tasksContainer = document.getElementById("tasks-container");

  const newTask = document.createElement('div');
  const newCheckMark = document.createElement("button");
  const newTasksText = document.createElement("span");
  const newDeleteButton = document.createElement("button");

  newTasksText.innerText = text;

  newTask.classList.add("tasks");
  newTask.setAttribute("draggable", "true");

  newCheckMark.classList.add("check-mark");
  newTasksText.classList.add("tasks-text");
  newDeleteButton.classList.add("delete");
  
  tasksContainer.append(newTask);
  newTask.append(newCheckMark, newTasksText, newDeleteButton);

  newDeleteButton.addEventListener("click", (deleteOneElement));
  newCheckMark.addEventListener("click", (checkItem));
   
  newTask.addEventListener("dragstart", (dragStart));
  newTasksText.addEventListener("dragenter", (dragEnter));
  newTasksText.addEventListener("dragover", (dragOver));
  newTasksText.addEventListener("dragleave", (dragLeave));
  newTasksText.addEventListener("drop", (drop));
};

/////////////////////////////////////////////////////////////
// On page load checks tasks by tasks.id from local storage //
/////////////////////////////////////////////////////////////

function checkedItems (checkedId) {
  document.querySelectorAll(".check-mark").forEach(elem => {
    if (+elem.parentElement.getAttribute("id") == checkedId) {
      elem.classList.add("checked");
      elem.nextSibling.classList.add("checked-text");
    }
  })
};

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

function checkItem (event) {
  event.target.classList.toggle("checked");
    event.target.nextElementSibling.classList.toggle("checked-text");
    let parentId = +event.target.parentNode.getAttribute("id");

    if (event.target.classList.contains("checked")) {
    savedChecked.push(parentId);
    localStorage.setItem('checked', JSON.stringify(savedChecked));
    } 
    else {
    savedChecked = savedChecked.filter((elem) => elem !== parentId);
    localStorage.setItem('checked', JSON.stringify(savedChecked));
    }
    activeTaskFilter();
};

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

function deleteOneElement (event) {
  let parentId = +event.target.parentNode.getAttribute("id");
    let parent = event.target.parentNode;

    savedTasks = savedTasks.filter((elem, index) => index != parentId);
    localStorage.setItem("tasks", JSON.stringify(savedTasks));
    parent.parentNode.removeChild(parent);

    itemsCounter();
    setTasksId();
    refreshCheckedLocalStorage();
    activeTaskFilter()
};

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

function setTasksId () {
  document.querySelectorAll(".tasks").forEach((elem, index) => {
    elem.setAttribute("id", index);
  });
};

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

function itemsCounter () {
  document.querySelector('#count-number').innerText = document.querySelectorAll(".tasks").length;
};

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

function refreshCheckedLocalStorage () {
    let allChecked = document.querySelectorAll('.checked');
    savedChecked = [];

    if (allChecked.length) {
      allChecked.forEach((elem) => {
      savedChecked.push(+elem.parentElement.id);
      })
    };

    localStorage.setItem("checked", JSON.stringify(savedChecked))
};

/////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////

function refreshTasksLocalStorage () {
  let allTasks = document.querySelectorAll('.tasks-text');
  savedTasks = [];

  if (allTasks.length) {
    allTasks.forEach((elem) => {
   savedTasks.push(elem.innerText);
   }) 
   }

   localStorage.setItem("tasks", JSON.stringify(savedTasks));
};

///////////////////////////
// Drag-and-drop handlers//
///////////////////////////

function dragStart(event) {
  event.dataTransfer.setData("task", event.target.getAttribute("id"));
};

/////////////////////////////////////////////////////////////

function dragEnter(event) {
  event.preventDefault();
  let taskId = event.dataTransfer.getData("task");
  if (event.target.classList.contains("tasks-text") && event.target.parentElement.id > taskId) {
    event.target.parentElement.classList.add("drop-after");
  } else {
    event.target.parentElement.classList.add("drop-before");
  }
};

/////////////////////////////////////////////////////////////

function dragOver(event) {
  event.preventDefault();
};

/////////////////////////////////////////////////////////////

function dragLeave(event) {
  if (event.target.classList.contains('tasks-text')) {
    event.target.parentElement.classList.remove("drop-before", "drop-after");
  }
};

/////////////////////////////////////////////////////////////

function drop(event) {
  event.preventDefault();
  if (event.target.classList.contains('tasks-text')) {
    event.target.parentElement.classList.remove("drop-before", "drop-after");
    let taskId = event.dataTransfer.getData("task");
    let element = document.getElementById(taskId);
    let taskContainer = event.target.parentElement;
    if (taskContainer.id > taskId) {
    taskContainer.after(element);
    } else {
      document.getElementById('tasks-container').insertBefore(element, taskContainer);
    }
    setTasksId();
    refreshTasksLocalStorage();
    refreshCheckedLocalStorage();
  }
};

//////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////

// Query selectors SHOULD be called on event to represent actual DOM.
// So that's why this similar var's declared in each function and event
// listener separately and not globally.

function activeTaskFilter() {
  let allChecked = document.querySelectorAll('.checked');
  let sortedOutTasks = document.querySelectorAll(".sorted-out");

  if (!sortedOutTasks.length) {
    document.querySelector('#sort-all').classList.add('active');
  } else {
    document.querySelector('#sort-all').classList.remove('active');
  };

  if (sortedOutTasks.length === allChecked.length) {
    document.querySelector('#sort-active').classList.add('active');
  } else {
    document.querySelector('#sort-active').classList.remove('active');
  };

  if (sortedOutTasks.length === document.querySelectorAll('.check-mark:not(.checked)').length) {
    document.querySelector('#sort-completed').classList.add('active');
  } else {
    document.querySelector('#sort-completed').classList.remove('active');
  };
};

////////////////////////////
////////////////////////////
// GENERAL EVENT LISTENERS//
////////////////////////////
////////////////////////////

//////////////////
// Sort buttons //
//////////////////

document.querySelector('#sort-all').addEventListener('click', () => {
  let allTasks = document.querySelectorAll('.tasks');

  allTasks.forEach(elem => {
    elem.classList.remove("sorted-out");
  })
  activeTaskFilter();
});

//////////////////////////////////////////////////////////////

document.querySelector('#sort-active').addEventListener("click", () => {
  let allTasks = document.querySelectorAll('.tasks');
  let allChecked = document.querySelectorAll('.checked');

  allTasks.forEach(elem => {
    elem.classList.remove("sorted-out");
  })
  allChecked.forEach(elem => {
    elem.parentElement.classList.add('sorted-out');
  })
  activeTaskFilter();
});

//////////////////////////////////////////////////////////////

document.querySelector("#sort-completed").addEventListener("click", () => {
  let allTasks = document.querySelectorAll('.tasks');

  allTasks.forEach(elem => {
    elem.classList.remove("sorted-out");
  })
  document.querySelectorAll('.check-mark:not(.checked)').forEach(elem => {
    elem.parentElement.classList.add('sorted-out');
  })
  activeTaskFilter();
});

//////////////////////////
// Clear Completed Tasks//
//////////////////////////

clear.addEventListener("click", () => {
  let allChecked = document.querySelectorAll('.checked');
  allChecked.forEach(elem => {
    elem.parentElement.remove();
  })
  itemsCounter();
  setTasksId();
  refreshTasksLocalStorage();
  refreshCheckedLocalStorage();
  activeTaskFilter();
});

/////////////////
// Add new task//
/////////////////

const input = document.getElementById("input-area");

input.addEventListener("keydown", (event) => {
  let inputText = input.value;

  if (inputText === '') return;
  if (event.key === "Enter") {

  savedTasks.push(inputText);
  localStorage.setItem("tasks", JSON.stringify(savedTasks));
  
  input.value = "";

  addTask(inputText);
  setTasksId();
  itemsCounter();
  activeTaskFilter();
}
});

////////////////////////
// Color theme switch //
////////////////////////

document.getElementById("theme-button").addEventListener ('click', () => {
  const CurrentColorScheme = document.documentElement.getAttribute(
    "data-color-scheme"
  );
  const newColorScheme = CurrentColorScheme === "default" ? "dark" : "default";
  document.documentElement.setAttribute("data-color-scheme", newColorScheme);
  localStorage.setItem("color-scheme", newColorScheme);
}); 

/////////////////////////
/////////////////////////
