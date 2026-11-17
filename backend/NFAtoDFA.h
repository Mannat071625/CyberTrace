
#pragma once
#include "NFA.h"
#include "DFA.h"

class NFAtoDFA {
public:
    static DFA convert(const NFA& nfa);
};
