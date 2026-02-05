
async function TaskPage() {

    const responce = await fetch("http://localhost:3000/api/tasks", {
        cache: "no-store"
    });

    const tasks = await responce.json();

    console.log(tasks);
  return (
    <div>
      TaskPage
    </div>
  )
}

export default TaskPage
