const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { EJSON } = require('bson');

require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const Problem = require('../src/models/problem');

const STARTER_TEMPLATES = {
  1: {
    // Addition of Two Numbers
    cpp: `#include <iostream>
using namespace std;

int addTwoNumbers(int a, int b) {
    // Write your code here
    return 0;
}

int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << addTwoNumbers(a, b) << endl;
    }
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static int addTwoNumbers(int a, int b) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.nextInt();
            System.out.println(addTwoNumbers(a, b));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function addTwoNumbers(a, b) {
    // Write your code here
    return 0;
}

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const [a, b] = input.split(/\\s+/).map(Number);
    console.log(addTwoNumbers(a, b));
}

main();`,
    python3: `import sys

def addTwoNumbers(a: int, b: int) -> int:
    # Write your code here
    return 0

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    a, b = map(int, input_data[:2])
    print(addTwoNumbers(a, b))

if __name__ == '__main__':
    main()`
  },

  2: {
    // Check Even or Odd
    cpp: `#include <iostream>
#include <string>
using namespace std;

string checkEvenOrOdd(int n) {
    // Return "Even" or "Odd"
    return "";
}

int main() {
    int n;
    if (cin >> n) {
        cout << checkEvenOrOdd(n) << endl;
    }
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static String checkEvenOrOdd(int n) {
        // Return "Even" or "Odd"
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            System.out.println(checkEvenOrOdd(n));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {number} n
 * @return {string}
 */
function checkEvenOrOdd(n) {
    // Return "Even" or "Odd"
    return "";
}

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const n = parseInt(input, 10);
    console.log(checkEvenOrOdd(n));
}

main();`,
    python3: `import sys

def checkEvenOrOdd(n: int) -> str:
    # Return "Even" or "Odd"
    return ""

def main():
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    n = int(input_data)
    print(checkEvenOrOdd(n))

if __name__ == '__main__':
    main()`
  },

  3: {
    // Factorial of a Number
    cpp: `#include <iostream>
using namespace std;

long long factorial(int n) {
    // Write your code here
    return 1;
}

int main() {
    int n;
    if (cin >> n) {
        cout << factorial(n) << endl;
    }
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static long factorial(int n) {
        // Write your code here
        return 1;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            System.out.println(factorial(n));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {number} n
 * @return {number}
 */
function factorial(n) {
    // Write your code here
    return 1;
}

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const n = parseInt(input, 10);
    console.log(factorial(n));
}

main();`,
    python3: `import sys

def factorial(n: int) -> int:
    # Write your code here
    return 1

def main():
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    n = int(input_data)
    print(factorial(n))

if __name__ == '__main__':
    main()`
  },

  4: {
    // Nth Fibonacci Number
    cpp: `#include <iostream>
using namespace std;

long long nthFibonacci(int n) {
    // Write your code here
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        cout << nthFibonacci(n) << endl;
    }
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static long nthFibonacci(int n) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            System.out.println(nthFibonacci(n));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {number} n
 * @return {number}
 */
function nthFibonacci(n) {
    // Write your code here
    return 0;
}

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const n = parseInt(input, 10);
    console.log(nthFibonacci(n));
}

main();`,
    python3: `import sys

def nthFibonacci(n: int) -> int:
    # Write your code here
    return 0

def main():
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    n = int(input_data)
    print(nthFibonacci(n))

if __name__ == '__main__':
    main()`
  },

  5: {
    // Palindrome Check
    cpp: `#include <iostream>
#include <string>
using namespace std;

string isPalindrome(const string& s) {
    // Return "Yes" or "No"
    return "No";
}

int main() {
    string s;
    if (cin >> s) {
        cout << isPalindrome(s) << endl;
    }
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static String isPalindrome(String s) {
        // Return "Yes" or "No"
        return "No";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            System.out.println(isPalindrome(s));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {string} s
 * @return {string} "Yes" or "No"
 */
function isPalindrome(s) {
    // Return "Yes" or "No"
    return "No";
}

function main() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    if (!s) return;
    console.log(isPalindrome(s));
}

main();`,
    python3: `import sys

def isPalindrome(s: str) -> str:
    # Return "Yes" or "No"
    return "No"

def main():
    s = sys.stdin.read().strip()
    if not s:
        return
    print(isPalindrome(s))

if __name__ == '__main__':
    main()`
  },

  6: {
    // Count Vowels
    cpp: `#include <iostream>
#include <string>
using namespace std;

int countVowels(const string& s) {
    // Write your code here
    return 0;
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << countVowels(s) << endl;
    }
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static int countVowels(String s) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            System.out.println(countVowels(s));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {string} s
 * @return {number}
 */
function countVowels(s) {
    // Write your code here
    return 0;
}

function main() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    console.log(countVowels(s));
}

main();`,
    python3: `import sys

def countVowels(s: str) -> int:
    # Write your code here
    return 0

def main():
    s = sys.stdin.read().strip()
    print(countVowels(s))

if __name__ == '__main__':
    main()`
  },

  7: {
    // Reverse a String
    cpp: `#include <iostream>
#include <string>
using namespace std;

string reverseString(const string& s) {
    // Write your code here
    return "";
}

int main() {
    string s;
    if (getline(cin, s)) {
        cout << reverseString(s) << endl;
    }
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static String reverseString(String s) {
        // Write your code here
        return "";
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String s = sc.nextLine();
            System.out.println(reverseString(s));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {string} s
 * @return {string}
 */
function reverseString(s) {
    // Write your code here
    return "";
}

function main() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    console.log(reverseString(s));
}

main();`,
    python3: `import sys

def reverseString(s: str) -> str:
    # Write your code here
    return ""

def main():
    s = sys.stdin.read().strip()
    print(reverseString(s))

if __name__ == '__main__':
    main()`
  },

  8: {
    // Two Sum Target
    cpp: `#include <iostream>
#include <vector>
using namespace std;

vector<int> twoSum(const vector<int>& nums, int target) {
    // Write your code here
    return {};
}

int main() {
    int n;
    if (cin >> n) {
        vector<int> nums(n);
        for (int i = 0; i < n; i++) cin >> nums[i];
        int target;
        cin >> target;
        vector<int> ans = twoSum(nums, target);
        if (!ans.empty()) {
            cout << ans[0] << " " << ans[1] << endl;
        }
    }
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            int[] nums = new int[n];
            for (int i = 0; i < n; i++) nums[i] = sc.nextInt();
            int target = sc.nextInt();
            int[] ans = twoSum(nums, target);
            if (ans.length >= 2) {
                System.out.println(ans[0] + " " + ans[1]);
            }
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your code here
    return [];
}

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (input.length < 3) return;
    const n = parseInt(input[0], 10);
    const nums = input[1].trim().split(/\\s+/).map(Number);
    const target = parseInt(input[2], 10);
    const res = twoSum(nums, target);
    console.log(res.join(' '));
}

main();`,
    python3: `import sys

def twoSum(nums, target):
    # Write your code here
    return []

def main():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 3:
        return
    n = int(lines[0].strip())
    nums = [int(x) for x in lines[1].strip().split()]
    target = int(lines[2].strip())
    res = twoSum(nums, target)
    print(" ".join(map(str, res)))

if __name__ == '__main__':
    main()`
  },

  9: {
    // Two Sum
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

vector<int> twoSum(const vector<int>& nums, int target) {
    // Write your code here
    return {};
}

int main() {
    string line1;
    if (getline(cin, line1)) {
        stringstream ss(line1);
        int val;
        vector<int> nums;
        while (ss >> val) nums.push_back(val);
        int target;
        cin >> target;
        vector<int> res = twoSum(nums, target);
        if (!res.empty()) cout << res[0] << " " << res[1] << endl;
    }
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String[] parts = sc.nextLine().trim().split("\\\\s+");
            int[] nums = new int[parts.length];
            for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
            int target = sc.nextInt();
            int[] res = twoSum(nums, target);
            if (res.length >= 2) System.out.println(res[0] + " " + res[1]);
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
    // Write your code here
    return [];
}

function main() {
    const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (lines.length < 2) return;
    const nums = lines[0].trim().split(/\\s+/).map(Number);
    const target = parseInt(lines[1].trim(), 10);
    const res = twoSum(nums, target);
    console.log(res.join(' '));
}

main();`,
    python3: `import sys

def twoSum(nums, target):
    # Write your code here
    return []

def main():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    nums = [int(x) for x in lines[0].strip().split()]
    target = int(lines[1].strip())
    res = twoSum(nums, target)
    print(" ".join(map(str, res)))

if __name__ == '__main__':
    main()`
  },

  10: {
    // Reverse Linked List
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

vector<int> reverseLinkedList(vector<int>& nums) {
    // Write your code here to reverse list
    return nums;
}

int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        int val;
        vector<int> nums;
        while (ss >> val) nums.push_back(val);
        vector<int> ans = reverseLinkedList(nums);
        for (size_t i = 0; i < ans.size(); i++) {
            cout << ans[i] << (i + 1 == ans.size() ? "" : " ");
        }
        cout << endl;
    }
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static List<Integer> reverseLinkedList(List<Integer> nums) {
        // Write your code here
        return nums;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String[] parts = sc.nextLine().trim().split("\\\\s+");
            List<Integer> list = new ArrayList<>();
            for (String p : parts) if (!p.isEmpty()) list.add(Integer.parseInt(p));
            List<Integer> ans = reverseLinkedList(list);
            for (int i = 0; i < ans.size(); i++) {
                System.out.print(ans.get(i) + (i + 1 == ans.size() ? "" : " "));
            }
            System.out.println();
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {number[]} nums
 * @return {number[]}
 */
function reverseLinkedList(nums) {
    // Write your code here
    return nums.reverse();
}

function main() {
    const line = fs.readFileSync(0, 'utf-8').trim();
    if (!line) return;
    const nums = line.split(/\\s+/).map(Number);
    console.log(reverseLinkedList(nums).join(' '));
}

main();`,
    python3: `import sys

def reverseLinkedList(nums):
    # Write your code here
    return nums[::-1]

def main():
    line = sys.stdin.read().strip()
    if not line:
        return
    nums = [int(x) for x in line.split()]
    print(" ".join(map(str, reverseLinkedList(nums))))

if __name__ == '__main__':
    main()`
  },

  11: {
    // Merge Two Sorted Lists
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
using namespace std;

vector<int> mergeTwoLists(const vector<int>& l1, const vector<int>& l2) {
    // Write your code here
    return {};
}

int main() {
    string line1, line2;
    if (getline(cin, line1) && getline(cin, line2)) {
        stringstream ss1(line1), ss2(line2);
        int v;
        vector<int> l1, l2;
        while (ss1 >> v) l1.push_back(v);
        while (ss2 >> v) l2.push_back(v);
        vector<int> merged = mergeTwoLists(l1, l2);
        for (size_t i = 0; i < merged.size(); i++) {
            cout << merged[i] << (i + 1 == merged.size() ? "" : " ");
        }
        cout << endl;
    }
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static List<Integer> mergeTwoLists(List<Integer> l1, List<Integer> l2) {
        // Write your code here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String[] p1 = sc.nextLine().trim().split("\\\\s+");
            String[] p2 = sc.hasNextLine() ? sc.nextLine().trim().split("\\\\s+") : new String[0];
            List<Integer> l1 = new ArrayList<>();
            List<Integer> l2 = new ArrayList<>();
            for (String s : p1) if (!s.isEmpty()) l1.add(Integer.parseInt(s));
            for (String s : p2) if (!s.isEmpty()) l2.add(Integer.parseInt(s));
            List<Integer> ans = mergeTwoLists(l1, l2);
            for (int i = 0; i < ans.size(); i++) {
                System.out.print(ans.get(i) + (i + 1 == ans.size() ? "" : " "));
            }
            System.out.println();
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {number[]} l1
 * @param {number[]} l2
 * @return {number[]}
 */
function mergeTwoLists(l1, l2) {
    // Write your code here
    return [];
}

function main() {
    const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (lines.length < 2) return;
    const l1 = lines[0].trim().split(/\\s+/).map(Number);
    const l2 = lines[1].trim().split(/\\s+/).map(Number);
    console.log(mergeTwoLists(l1, l2).join(' '));
}

main();`,
    python3: `import sys

def mergeTwoLists(l1, l2):
    # Write your code here
    return []

def main():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    l1 = [int(x) for x in lines[0].strip().split()]
    l2 = [int(x) for x in lines[1].strip().split()]
    print(" ".join(map(str, mergeTwoLists(l1, l2))))

if __name__ == '__main__':
    main()`
  },

  12: {
    // Climbing Stairs
    cpp: `#include <iostream>
using namespace std;

int climbStairs(int n) {
    // Write your code here
    return 0;
}

int main() {
    int n;
    if (cin >> n) {
        cout << climbStairs(n) << endl;
    }
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static int climbStairs(int n) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int n = sc.nextInt();
            System.out.println(climbStairs(n));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {number} n
 * @return {number}
 */
function climbStairs(n) {
    // Write your code here
    return 0;
}

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const n = parseInt(input, 10);
    console.log(climbStairs(n));
}

main();`,
    python3: `import sys

def climbStairs(n: int) -> int:
    # Write your code here
    return 0

def main():
    input_data = sys.stdin.read().strip()
    if not input_data:
        return
    n = int(input_data)
    print(climbStairs(n))

if __name__ == '__main__':
    main()`
  },

  13: {
    // Maximum Subarray
    cpp: `#include <iostream>
#include <vector>
#include <sstream>
#include <algorithm>

using namespace std;

int maxSubArray(const vector<int>& nums) {
    // Write your code here to find the maximum subarray sum
    return 0;
}

int main() {
    string line;
    if (getline(cin, line)) {
        stringstream ss(line);
        int val;
        vector<int> nums;
        while (ss >> val) nums.push_back(val);
        cout << maxSubArray(nums) << endl;
    }
    return 0;
}`,
    java: `import java.util.*;
import java.io.*;

public class Main {
    public static int maxSubArray(int[] nums) {
        // Write your code here to find the maximum subarray sum
        return 0;
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        String line = br.readLine();
        if (line == null || line.trim().isEmpty()) return;
        String[] parts = line.trim().split("\\\\s+");
        int[] nums = new int[parts.length];
        for (int i = 0; i < parts.length; i++) nums[i] = Integer.parseInt(parts[i]);
        System.out.println(maxSubArray(nums));
    }
}`,
    javascript: `const readline = require('readline');

function maxSubArray(nums) {
    // Write your code here
    return 0;
}

const rl = readline.createInterface({ input: process.stdin });
rl.on('line', (line) => {
    if (!line.trim()) return;
    const nums = line.trim().split(/\\s+/).map(Number);
    console.log(maxSubArray(nums));
});`,
    python3: `import sys

def maxSubArray(nums):
    # Write your code here to find the maximum subarray sum
    return 0

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    nums = [int(x) for x in input_data]
    print(maxSubArray(nums))

if __name__ == '__main__':
    main()`
  },

  14: {
    // Valid Parentheses
    cpp: `#include <iostream>
#include <string>
#include <stack>

using namespace std;

bool isValid(const string& s) {
    // Write your solution here
    return false;
}

int main() {
    string s;
    if (cin >> s) {
        cout << (isValid(s) ? "true" : "false") << endl;
    }
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static boolean isValid(String s) {
        // Write your solution here
        return false;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNext()) {
            String s = sc.next();
            System.out.println(isValid(s));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * Problem: Valid Parentheses
 * Determine if the input string has valid matching brackets '()', '{}', '[]'.
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
    // Write your solution here
    return false;
}

function main() {
    const s = fs.readFileSync(0, 'utf-8').trim();
    console.log(isValid(s));
}

main();`,
    python3: `import sys

def isValid(s: str) -> bool:
    # Write your solution here
    return False

def main():
    s = sys.stdin.read().strip()
    print(str(isValid(s)).lower())

if __name__ == '__main__':
    main()`
  },

  15: {
    // Longest Common Subsequence
    cpp: `#include <iostream>
#include <string>
#include <vector>

using namespace std;

int longestCommonSubsequence(const string& text1, const string& text2) {
    // Write your solution here
    return 0;
}

int main() {
    string text1, text2;
    if (getline(cin, text1) && getline(cin, text2)) {
        cout << longestCommonSubsequence(text1, text2) << endl;
    }
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static int longestCommonSubsequence(String text1, String text2) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextLine()) {
            String text1 = sc.nextLine().trim();
            String text2 = sc.hasNextLine() ? sc.nextLine().trim() : "";
            System.out.println(longestCommonSubsequence(text1, text2));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {string} text1
 * @param {string} text2
 * @return {number}
 */
function longestCommonSubsequence(text1, text2) {
    // Write your solution here
    return 0;
}

function main() {
    const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (lines.length < 2) return;
    const text1 = lines[0].trim();
    const text2 = lines[1].trim();
    console.log(longestCommonSubsequence(text1, text2));
}

main();`,
    python3: `import sys

def longestCommonSubsequence(text1: str, text2: str) -> int:
    # Write your solution here
    return 0

def main():
    lines = sys.stdin.read().strip().split('\\n')
    if len(lines) < 2:
        return
    text1 = lines[0].strip()
    text2 = lines[1].strip()
    print(longestCommonSubsequence(text1, text2))

if __name__ == '__main__':
    main()`
  },

  16: {
    // Number of Islands
    cpp: `#include <iostream>
#include <vector>

using namespace std;

int numIslands(vector<vector<char>>& grid) {
    // Write your solution here
    return 0;
}

int main() {
    int m, n;
    if (cin >> m >> n) {
        vector<vector<char>> grid(m, vector<char>(n));
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                cin >> grid[i][j];
            }
        }
        cout << numIslands(grid) << endl;
    }
    return 0;
}`,
    java: `import java.util.*;

public class Main {
    public static int numIslands(char[][] grid) {
        // Write your solution here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int m = sc.nextInt();
            int n = sc.nextInt();
            char[][] grid = new char[m][n];
            for (int i = 0; i < m; i++) {
                for (int j = 0; j < n; j++) {
                    grid[i][j] = sc.next().charAt(0);
                }
            }
            System.out.println(numIslands(grid));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {string[][]} grid
 * @return {number}
 */
function numIslands(grid) {
    // Write your solution here
    return 0;
}

function main() {
    const lines = fs.readFileSync(0, 'utf-8').trim().split('\\n');
    if (!lines.length) return;
    const [m, n] = lines[0].trim().split(/\\s+/).map(Number);
    const grid = [];
    for (let i = 1; i <= m && i < lines.length; i++) {
        grid.push(lines[i].trim().split(/\\s+/));
    }
    console.log(numIslands(grid));
}

main();`,
    python3: `import sys

def numIslands(grid):
    # Write your solution here
    return 0

def main():
    lines = sys.stdin.read().strip().split('\\n')
    if not lines:
        return
    parts = lines[0].strip().split()
    m, n = int(parts[0]), int(parts[1])
    grid = []
    for i in range(1, m + 1):
        if i < len(lines):
            grid.append(lines[i].strip().split())
    print(numIslands(grid))

if __name__ == '__main__':
    main()`
  },

  17: {
    // Multiply Two Numbers
    cpp: `#include <iostream>
using namespace std;

int multiplyTwoNumbers(int a, int b) {
    // Write your code here
    return 0;
}

int main() {
    int a, b;
    if (cin >> a >> b) {
        cout << multiplyTwoNumbers(a, b) << endl;
    }
    return 0;
}`,
    java: `import java.util.Scanner;

public class Main {
    public static int multiplyTwoNumbers(int a, int b) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        if (sc.hasNextInt()) {
            int a = sc.nextInt();
            int b = sc.nextInt();
            System.out.println(multiplyTwoNumbers(a, b));
        }
    }
}`,
    javascript: `const fs = require('fs');

/**
 * @param {number} a
 * @param {number} b
 * @return {number}
 */
function multiplyTwoNumbers(a, b) {
    // Write your code here
    return 0;
}

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim();
    if (!input) return;
    const [a, b] = input.split(/\\s+/).map(Number);
    console.log(multiplyTwoNumbers(a, b));
}

main();`,
    python3: `import sys

def multiplyTwoNumbers(a: int, b: int) -> int:
    # Write your code here
    return 0

def main():
    input_data = sys.stdin.read().split()
    if not input_data:
        return
    a, b = map(int, input_data[:2])
    print(multiplyTwoNumbers(a, b))

if __name__ == '__main__':
    main()`
  }
};

async function updateStarters() {
  const isApply = process.argv.includes('--apply');
  console.log(`\n======================================================`);
  console.log(`=== PROBLEM STARTER CODE UPDATER (${isApply ? 'APPLY MODE' : 'DRY RUN'}) ===`);
  console.log(`======================================================\n`);

  await mongoose.connect(process.env.DB_CONNECT_STRING);
  const db = mongoose.connection.db;

  const problems = await Problem.find({}).sort({ problemNumber: 1 });
  console.log(`Found ${problems.length} problems in database.`);

  let updatedCount = 0;

  for (const prob of problems) {
    const tpl = STARTER_TEMPLATES[prob.problemNumber];
    if (!tpl) {
      console.log(`[SKIP] No predefined template for #${prob.problemNumber} (${prob.title})`);
      continue;
    }

    const newStartCode = [
      { language: 'C++', initialCode: tpl.cpp },
      { language: 'Java', initialCode: tpl.java },
      { language: 'JavaScript', initialCode: tpl.javascript },
      { language: 'Python3', initialCode: tpl.python3 }
    ];

    if (isApply) {
      await db.collection('problems').updateOne(
        { _id: prob._id },
        { $set: { startCode: newStartCode } }
      );
      console.log(`✔ Updated startCode for #${prob.problemNumber}: ${prob.title} (C++, Java, JavaScript, Python3)`);
      updatedCount++;
    } else {
      console.log(`[DRY RUN] Would update startCode for #${prob.problemNumber}: ${prob.title}`);
    }
  }

  // Refresh Compass Data if applied
  const compassDir = path.join(__dirname, '..', '..', 'DataPart', 'mongodb_compass_data');
  if (isApply && fs.existsSync(compassDir)) {
    console.log('\nRefreshing problems.json in Compass data export...');
    const allProblems = await db.collection('problems').find({}).toArray();
    const serialized = allProblems.map((doc) => EJSON.serialize(doc, { relaxed: true }));
    fs.writeFileSync(path.join(compassDir, 'problems.json'), JSON.stringify(serialized, null, 2), 'utf-8');
    console.log(`Saved ${allProblems.length} problems to ${compassDir}/problems.json`);
  }

  console.log(`\n======================================================`);
  console.log(`Updated ${isApply ? updatedCount : 0} problems.`);
  console.log(`======================================================\n`);

  await mongoose.disconnect();
}

updateStarters().catch(err => {
  console.error('Update failed:', err);
  process.exit(1);
});
