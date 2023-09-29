import { revalidatePath } from "next/cache";
import AddButton from "./AddButton";

// Initialize an array to store todos
const todos: string[] = ["Next.js Form"];

export default function Home() {
  // Function to add a todo
  async function addTodo(data: FormData) {
    "use server"; // Indicates that this function should run on the server

    // Simulate a delay (e.g., API call) so we can see the useFormState efect on AddButton
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Get the todo from form data
    const todo = data.get("todo") as string;

    // Add the todo to the array
    todos.push(todo);

    // Revalidate the path to update data
    revalidatePath("/todos");
  }

  return (
    <main className="p-5">
      <h1 className="text-4xl font-bold">Todos</h1>
      <ul>
        {/* Map over todos and render each one */}
        {todos.map((todo, index) => (
          <li key={index}>{todo}</li>
        ))}
      </ul>
      {/* In a standard HTML form, the action attribute specifies the URL where the form data should be sent when the user submits the form. 
      However, in this case, we are calling the server action function */}
      <form action={addTodo}>
        <input
          type="text"
          name="todo"
          className="border border-gray-300 rounded-lg py-4 px-4 text-base font-normal text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
        />
        <AddButton />
      </form>
    </main>
  );
}
