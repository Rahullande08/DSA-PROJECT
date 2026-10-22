Your project: Recursion Studio — complete information
Your project should teach students how recursion works internally, not just calculate factorial and Fibonacci answers. The following is the information you can use while creating Python files and explaining the project to your teacher.
1. Project overview
Recursion Studio: ASCII Edition
A Data Structures and Algorithms visualization project

Objective: To help students understand recursive function calls, base cases, return values, recursion trees, and the call stack through interactive visualizations.

Main algorithms
- Factorial using recursion
- Fibonacci series using recursion
- Recursion tree visualization
- Call stack and function return tracing
- Execution steps and complexity analysis

2. Create these Python files
In your project, create a folder named python_examples and add these files.
python_examples/

factorial.py

Recursive factorial and call trace


fibonacci.py

Recursive Fibonacci and series output


recursion_demo.py

Compare both algorithms from one menu




3. File 1 — factorial.py
This version uses actual recursion, which is more relevant to your Recursion Studio project than the earlier loop-based program.


# Factorial using recursion

def factorial(n):
    # Base case
    if n == 0 or n == 1:
        return 1

    # Recursive call
    return n * factorial(n - 1)


num = int(input("Enter a non-negative number: "))

if num < 0:
    print("Please enter a non-negative number.")
elif num > 900:
    print("Please enter a number up to 900.")
else:
    result = factorial(num)
    print("Factorial of", num, "=", result)



How the recursion works
For factorial(4), the calls happen in this order:

factorial(4) → 4 × factorial(3)

factorial(3) → 3 × factorial(2)

factorial(2) → 2 × factorial(1)

factorial(1) → 1  (base case)

Returns: 1 → 2 → 6 → 24

output:
Enter a non-negative number: 4
Factorial of 4 = 24

Complexity: Time \(O(n)\), auxiliary stack space \(O(n)\).


4. File 2 — fibonacci.py
This program calculates Fibonacci numbers using recursion and prints the first n terms.


# Fibonacci series using recursion

def fibonacci(n):
    # Base cases
    if n == 0:
        return 0
    if n == 1:
        return 1

    # Recursive calls
    return fibonacci(n - 1) + fibonacci(n - 2)


terms = int(input("Enter number of terms (0-30): "))

if terms < 0 or terms > 30:
    print("Please enter a number between 0 and 30.")
else:
    print("Fibonacci series:")

    for i in range(terms):
        print(fibonacci(i), end=" ")

    print()


5. File 3 — recursion_demo.py
Use this file to demonstrate both programs from a single menu during your presentation.

# Recursion Studio - Simple Console Demo

def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)


def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)


while True:
    print("\n--- RECURSION STUDIO ---")
    print("1. Factorial")
    print("2. Fibonacci series")
    print("3. Exit")

    choice = input("Choose an option: ")

    if choice == "1":
        n = int(input("Enter a non-negative number: "))
        if n < 0 or n > 900:
            print("Number out of range.")
        else:
            print("Factorial =", factorial(n))

    elif choice == "2":
        terms = int(input("Enter number of terms (0-30): "))
        if terms < 0 or terms > 30:
            print("Number out of range.")
        else:
            for i in range(terms):
                print(fibonacci(i), end=" ")
            print()

    elif choice == "3":
        print("Thank you for using Recursion Studio!")
        break

    else:
        print("Invalid choice. Try again.")
