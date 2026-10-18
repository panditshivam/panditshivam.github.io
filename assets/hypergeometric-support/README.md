# Probability support chart

Original chart for Shivam Dwivedi's article on sampling without replacement.
Rendered with Matplotlib from a completed exact enumeration of all 210 unordered
six-object draws from seven marked and three unmarked objects. The independent
binomial comparison is calculated exactly with probability 7/10 per trial.

No third-party photos or generated test images are used. The chart depicts
synthetic counts, not an empirical benchmark. SciPy 1.18.1 agrees with the exact
hypergeometric probabilities within floating-point tolerance.

Reference: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.hypergeom.html


## Cookie-jar teaching visuals

The cookie storyboard and five-frame GIF illustrate the same finite-population
count using seven chocolate and three plain cookies. The scenes show possible
and impossible boxes; they are original teaching diagrams, not a recorded random
draw or new experiment data. C means chocolate and P means plain. The static
storyboard shows the initial jar and the boundary examples without animation.

`cookie-count-probabilities.png` renders the saved exact without-replacement
probabilities and the independent binomial control on matched axes. All artwork
is original; no Wikipedia images, external photographs or model-generated art
were copied. The article links the underlying concept references separately.
