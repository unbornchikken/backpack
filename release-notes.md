0.1.13

Improved:
- ES6 Map used in Serializer for performance (if available)
- Serializer will use array based circular path marker instead of string for performance 

0.1.12

Changed:
- Mocha instead of nodeunit
- Lodash instead of underscore

Improved:
- StrSet wont serialize count
- StrSet.add: key won't verified twice

Started:
- Harmony collections support (not yet implemented, because there is no way to iterate through elements)

0.1.11

Various bugfixes

0.1.10

Improved:
- Built in (collection) types are now serializable by default, no manual type registration required.
- serializeToJSON / deserializeFromJSON works on complex objects (result gets serialized too);

0.1.9

Added:
- Serializer improvements: serializeToJSON, deserializeFromJSON methods (not in the readme yet, see: tests/system/serializeTest.js "should support custom serialization" test for details)

0.1.8 

Promo Release