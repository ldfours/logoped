+++
date = 2023-07-29
title = "Speech-Language Therapy"
description = "Licensed Speech-Language Pathologist provides excellent service for children and adults. Individual virtual care services offer support and convenience for our clients and their families."
authors = []
[taxonomies]
tags = ["slp", "therapy"]
[extra]
math = false
image = "speech-pathologist.png"
+++

<!--
The internal rate of return (IRR) is a potent financial measure used in financial analysis, accounting, and portfolio management to gauge the profitability of investments.
It's like the heartbeat of an investment - an indicator of health, the higher it is, the better the investment.
This powerful tool can help investors compare different investment options, assisting in making informed decisions about where to allocate their capital.
Especially when cash flows are irregular, as often is the case in real-world scenarios, IRR becomes invaluable.
This article will first explain the concept and calculations behind IRR and then demonstrate how to implement an IRR algorithm in Rust.

## IRR vs. XIRR terminology

The IRR is the rate of return that makes the net present value (NPV) of all cash flows (both positive and negative) from a particular investment equal to zero.
It's sometimes used for cash flows at regular, usually annual, intervals.
I will not make this assumption in this article.
While Microsoft uses the name XIRR for its Excel function, I will use the term IRR throughout this article, even though the cash flows do not occur at regular intervals.

## Example data and validation

A crucial part of implementing a financial algorithm like IRR is validation -- that is, making sure that your algorithm is producing correct and expected results.
One effective way to validate your implementation is by comparing its outputs to those of [Microsoft Excel's XIRR function](https://support.microsoft.com/en-gb/office/xirr-function-de1242ec-6477-445b-b11b-a303ad9adc9d).
I will use the data from the Excel example.
Using Excel's XIRR function to compute the internal rate of return for this specific data set yields a result of $37.34\\%$.

| $\textbf{i}$ | ISO Date $\textbf{d}$ | Years since first cash flow $\textbf{y}$ | Payment $\textbf{p}$ |
|-------------:|-----------------------|-----------------------------------------:|---------------------:|
|            1 | 2008-01-01            |                                   0.0000 |              -10,000 |
|            2 | 2008-03-01            |                                   0.1644 |                2,750 |
|            3 | 2008-10-30            |                                   0.8301 |                4,250 |
|            4 | 2009-02-15            |                                   1.1260 |                3,250 |
|            5 | 2009-04-01            |                                   1.2493 |                2,750 |


## How IRR works

The IRR is calculated by finding the rate of return that would make the net present value (NPV) of an investment equal to zero.
The NPV is the sum of the present values of all future cash flows from an investment.
The derivative of the NPV is used to find the IRR.
The derivative of the NPV is the rate of change of the NPV with respect to the interest rate.

The IRR algorithm is an instance of the [Newton-Raphson method](https://en.wikipedia.org/wiki/Newton%27s_method),
which is a root-finding algorithm that produces successively better approximations to the roots (or zeroes) of a real-valued function.
To calculate the IRR, you need an array with pairs of data: one is the date of a cash flow, and the other is its payment amount.
You also need an initial guess for the IRR rate, which is often set as $10\\%$ or $0.1$.

Here's the general process of the algorithm:

1. **Compute the net present value (NPV)**: The NPV is calculated by summing the present values of the individual cash flows.
1. **Compute the derivative of the NPV**: The derivative of the NPV with respect to the rate is created by differentiating the NPV formula and summing these values.
1. **Update the guess**: The next guess for the rate is calculated by subtracting the ratio of the NPV to its derivative from the current guess.
1. **Iterate until convergence**: These steps are repeated until the change in guesses is below a certain tolerance, or until a maximum number of iterations is reached.
   At this point, the guess for the rate is considered to be the IRR.


## Compute the net present value (NPV)

Here, $y_i$ represents the number of years that have passed since the first cash flow,
calculated as the difference in days between the date of the $i$-th cash flow $d_i$ and the date of the first cash flow $d_1$,
divided by 365 (days in one year).
I have pre-calculated it in the table above:

$$y_i = \frac{d_i - d_1}{365}$$

The NPV is the sum of all payments, where the correct interest rate $irr$ is applied.
Its value is 0 after all transaction have been concluded:

$$\mathit{NPV} = \sum_{i = 1}^{m} \frac{p_i}{(1 + irr)^{y_i}}$$

When you [plot](https://www.wolframalpha.com/input?i=plot+-10000*%281%2F%281+%2B+x%29%5E%280.0000%29%29+%2B+2750*%281%2F%281+%2B+x%29%5E%280.1644%29%29+%2B+4250*%281%2F%281+%2B+x%29%5E%280.8301%29%29+%2B+3250*%281%2F%281+%2B+x%29%5E%281.1260%29%29+%2B+2750*%281%2F%281+%2B+x%29%5E%281.2493%29%29+from+x%3D-0.1+to+0.9) the NPV function as a function of $irr$,
you are essentially varying the interest rate and observing how it affects the NPV.
Here's what you see on the graph below, which plots the NPV as a function of the rate with the values from the table above:

- **X-axis**: The x-axis represents the interest rate $irr$.
  It typically ranges from $0\\%$ to a reasonable upper limit, depending on the context of your problem.
- **Y-axis**: The y-axis represents the net present value NPV.
  It's the cumulative sum of the discounted cash flows according to the given formula.
- **Shape of the curve**: The curve of the NPV function will generally be downward-sloping.
  This is because as you increase the interest rate $irr$, the present value of future cash flows decreases.
  Higher interest rates mean that future cash flows are being discounted more heavily, which reduces their present value.
- **Break-even point**: There will be a point on the graph where the NPV curve intersects the x-axis.
  It's where our $irr$ satisfies the condition $\mathit{NPV} = 0$.
  For our data, it is somewhere between $0.35$ and $0.40$, or $35\\%$ and $40\\%$.

![Plot of the NPV as a function of the rate with the values from the table](irr-npv-function.png)

The above formula is a sum of function terms.
Applying the [superposition principle](https://en.wikipedia.org/wiki/Superposition_principle),
we can split the sum into individual function terms, which look all the same.
For each cash flow, we have a function term, which is the present value of the cash flow.
The important part is that we can apply this principle to the NPV function **and** the derivative of the NPV function.

With $irr$ written as $x$, each function term looks like this, where $p_i$ and $y_i$ are just constants.
$f_i(x)$ represents the NPV for a single cash flow, the $i$-th one:

$$f_i(x) = \frac{p_i}{(1 + x)^{y_i}}$$

The amount $p_i$ is discounted in the NPV calculation to reflect the time value of money. Here's an explanation for why that's done:

- **Time value of money**: Money available today is worth more than the same amount in the future because of its potential earning capacity.
  This core principle of finance holds that, provided money can earn interest, any amount of money is worth more the sooner it is received.
- **Discounting future cash flows**: In the context of the internal rate of return (IRR) and net present value (NPV), this principle is applied to future cash flows.
  The $p_i$ represents a payment (cash flow) at some future date. To compare this future value to present values,
  it needs to be discounted back to its value in today's terms.
- **The discount factor**: The expression $\frac{1}{(1 + x)^{y_i}}$ serves as a discount factor, where $x$ is the internal rate of return, and $y_i$ is the number of years that have passed since the first cash flow.
  This factor is derived from the formula for compounding interest in reverse (discounting rather than compounding).
- **Sum of discounted payments**: The NPV is the sum of these discounted payments. By discounting each future cash flow back to its present value,
  the NPV provides a consistent basis for comparing the value of cash flows across different time periods.
- **Understanding the equation**: The equation $f_i(x) = \frac{p_i}{(1 + x)^{y_i}}$ represents the present value of the $i$-th cash flow.
  It shows how each cash flow is discounted back to present value terms using the discount factor.

Discounting the $p_i$ in the NPV calculation allows for a proper comparison of cash flows across different time periods,
taking into account the time value of money and the specific internal rate of return (IRR) required from the investment.
It ensures that future cash flows are appropriately weighed against the potential earning capacity of money in the present.

### But what happens if ...

The expression $(1 + x)^{y_i}$ can become a problem if $x < -1$ (less than $-100\\%$), because raising a negative number to a non-integer power will result in a complex number.
Within the realm of real numbers, this operation is undefined.
For example, consider a case where $x = -1.1$ and $y_i$ is a floating point number like $0.4$.
Then, $(1 + x)$ will be negative, and raising it to the $y_i$ power [produces a complex value](https://www.wolframalpha.com/input?i=%281+-+1.1%29%5E%280.4%29):
${(1 - 1.1)}^{0.4} \approx 0.12 + 0.38 i$

In the context of finance and the calculation of IRR, it doesn't make sense to have complex numbers as they don't have a practical interpretation in terms of cash flows or discount rates.
Therefore, you would typically ensure that the rate $x$ stays within the range where the calculation remains within the realm of real numbers.
If you're working with cash flows and discount rates, you may want to either avoid or handle situations where $x < -1$ by constraining the value of $x$ within a reasonable range or taking some other specific action if $x$ falls outside that range.

In practice, it's rare that you would come across this scenario.
-->
