"""Illustration, not Mistral inference. Python standard library only."""
import json
import math


def top_k(scores, k):
    return sorted(range(len(scores)), key=lambda i: (-scores[i], i))[:k]


def selected_softmax(scores, selected):
    peak = max(scores[i] for i in selected)
    weights = [math.exp(scores[i] - peak) for i in selected]
    total = sum(weights)
    return [w / total for w in weights]


def run():
    expert_scores = [0.2, 2.0, -0.5, 1.0]
    # Only already available positions are eligible in this causal toy.
    position_scores = [0.1, 1.3, -0.2, 0.8, 0.4, -0.6]
    experts = top_k(expert_scores, 2)
    positions = top_k(position_scores, 3)
    weights = selected_softmax(expert_scores, experts)
    expert_outputs = [10.0, 20.0, 30.0, 40.0]
    routed = sum(w * expert_outputs[i] for i, w in zip(experts, weights))
    assert experts == [1, 3] and positions == [1, 3, 4]
    assert math.isclose(sum(weights), 1.0)
    assert math.isclose(routed, 25.378828427399902)
    changed_positions = top_k([9.0, 0, 0, 0, 0, 8.0], 3)
    assert changed_positions != positions and top_k(expert_scores, 2) == experts
    return {
        "kind": "illustrative, independent selectors; not model activations",
        "expert_scores": expert_scores, "position_scores": position_scores,
        "selected_experts_zero_based": experts,
        "selected_positions_zero_based": positions,
        "selected_expert_weights": weights,
        "routed_toy_scalar": routed,
        "checks": "known indices, normalized weights, scalar oracle, independent inputs",
    }


if __name__ == "__main__":
    print(json.dumps(run(), indent=2))
